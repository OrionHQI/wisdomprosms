require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const crypto = require("crypto");
const PagaCollectClient = require("paga-collect");
const pagaCollectClient = new PagaCollectClient()
  .setClientId(process.env.PAGA_PUBLIC_KEY)
  .setPassword(process.env.PAGA_SECRET_KEY)
  .setApiKey(process.env.PAGA_HASH_KEY)
  .setTest(false)
  .build();
const app = express();
const PORT = 3000;

// Allow JSON data
app.use(express.json());
app.use(cors());

function hasLivePagaConfiguration() {
    return Boolean(
        process.env.PAGA_PUBLIC_KEY === "19fc8ff2-9063-4756-829a-79f91df75723" &&
        process.env.PAGA_SECRET_KEY === "KPIgP5FafF48JY6RB2CffyqvvPMV5M0S" &&
        process.env.PAGA_HASH_KEY === "9b5e1107f101460a84c1930ee02aa14fb8bba7d20602477c8dc3e187f4dc13e4e7e68260d8c0462a8df9d2e1c5ef2ed0b3f26be7605e4b7591e73507cc0230a5" &&
        process.env.BACKEND_URL === "https://wisdomprosms-backend.onrender.com" &&
        process.env.PAGA_CHARGE_URL
    );
}

function createPagaCheckoutUrl({ referenceNumber, amount, email, phoneNumber }) {
    const checkoutUrl = new URL("https://checkout.paga.com/checkout/params");
    checkoutUrl.search = new URLSearchParams({
        public_key: process.env.PAGA_PUBLIC_KEY,
        amount: amount.toFixed(2),
        currency: "NGN",
        payment_reference: referenceNumber,
        charge_url: process.env.PAGA_CHARGE_URL,
        callback_url: `${process.env.BACKEND_URL}/paga/callback`,
        email,
        ...(phoneNumber ? { phone_number: phoneNumber } : {}),
        funding_sources: "CARD,PAGA,TRANSFER,AGENT,USSD"
    }).toString();
    return checkoutUrl.toString();
}

function isValidPagaCallbackHash(payload) {
    const amount = Number(payload.amount);
    if (!Number.isFinite(amount) || !payload.timeStamp || !payload.paymentReference || !payload.hash) {
        return false;
    }

    const expectedHash = crypto
        .createHash("sha512")
        .update(`${amount.toFixed(2)}${payload.timeStamp}${payload.paymentReference}${process.env.PAGA_HASH_KEY}`)
        .digest("hex");

    const receivedHash = String(payload.hash).toLowerCase();
    return receivedHash.length === expectedHash.length &&
        crypto.timingSafeEqual(Buffer.from(receivedHash), Buffer.from(expectedHash));
}

async function verifyPagaCharge(paymentReference, amount) {
    const response = await fetch("https://checkout.paga.com/checkout/transaction/verify", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Basic ${Buffer.from(`${process.env.PAGA_PUBLIC_KEY}:${process.env.PAGA_SECRET_KEY}`).toString("base64")}`
        },
        body: JSON.stringify({
            paymentReference,
            publicKey: process.env.PAGA_PUBLIC_KEY,
            amount,
            currency: "NGN"
        })
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : null;
    if (!response.ok || !data) {
        throw new Error(`Paga verification failed with HTTP ${response.status}.`);
    }
    return data;
}
// ================= AUTHENTICATION MIDDLEWARE =================

function authenticateToken(req, res, next) {

    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {

        return res.status(401).json({
            message: "Authentication required."
        });

    }

    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (error, user) => {

            if (error) {

                return res.status(403).json({
                    message: "Invalid or expired token."
                });

            }

            req.user = user;

            next();

        }
    );

}

// ================= DATABASE =================

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});


// ================= HOME =================

app.get("/", (req, res) => {
    res.json({
        message: "WisdomProSMS backend is running!"
    });
});


// ================= DATABASE TEST =================

app.get("/db-test", async (req, res) => {

    try {

        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "WisdomProSMS database connected!",
            time: result.rows[0].now
        });

    } catch (error) {

        console.error("Database error:", error);

        res.status(500).json({
            message: "Database connection failed.",
            error: error.message
        });

    }

});

// ================= PROTECTED DASHBOARD TEST =================

app.get("/dashboard-test", authenticateToken, async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT id, full_name, email, wallet_balance
             FROM users
             WHERE id = $1`,
            [req.user.userId]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "User not found."
            });

        }

        res.json({
            message: "Welcome to your WisdomProSMS dashboard!",
            user: result.rows[0]
        });

    } catch (error) {

        console.error("Dashboard error:", error);

        res.status(500).json({
            message: "Unable to load dashboard."
        });

    }

});
// ================= REAL DASHBOARD =================

app.get("/dashboard", authenticateToken, async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT id, full_name, email, wallet_balance, created_at
             FROM users
             WHERE id = $1`,
            [req.user.userId]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "User not found."
            });

        }

        res.json({
            user: result.rows[0]
        });

    } catch (error) {

        console.error("Dashboard error:", error);

        res.status(500).json({
            message: "Unable to load dashboard."
        });

    }

});
// ================= SIGN UP =================

app.post("/signup", async (req, res) => {

    try {

        const { full_name, email, password } = req.body;

        // Check required fields
        if (!full_name || !email || !password) {

            return res.status(400).json({
                message: "Please provide your full name, email and password."
            });

        }

        // Check if email already exists
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {

            return res.status(409).json({
                message: "An account with this email already exists."
            });

        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const result = await pool.query(
            `INSERT INTO users
            (full_name, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, full_name, email, wallet_balance, created_at`,
            [full_name, email, passwordHash]
        );

        res.status(201).json({
            message: "Account created successfully!",
            user: result.rows[0]
        });

    } catch (error) {

        console.error("Signup error:", error);

        res.status(500).json({
            message: "Unable to create account.",
            error: error.message
        });

    }

});

// ================= LOGIN =================

app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                message: "Please provide your email and password."
            });

        }

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {

            return res.status(401).json({
                message: "Invalid email or password."
            });

        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {

            return res.status(401).json({
                message: "Invalid email or password."
            });

        }

        const token = jwt.sign(
    {
        userId: user.id,
        email: user.email
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "7d"
    }
);

res.json({

    message: "Login successful!",

    token: token,

    user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        wallet_balance: user.wallet_balance
    }

});

    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({
            message: "Unable to login."
        });

    }

});
// ================= MY NUMBERS =================

app.get("/my-numbers", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, phone_number, country, service, status, created_at
             FROM numbers
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [req.user.userId]
        );

        res.json({
            numbers: result.rows
        });

    } catch (error) {
        console.error("My Numbers error:", error);

        res.status(500).json({
            message: "Unable to load your numbers."
        });
    }
});
// ================= AVAILABLE NUMBERS =================

app.get("/available-numbers", async (req, res) => {
  try {
    const { country, service } = req.query;

    let query = `
      SELECT id, phone_number, country, service, status
      FROM numbers
      WHERE status = 'available'
    `;

    const values = [];

    if (country) {
      values.push(country);
      query += ` AND country = $${values.length}`;
    }

    if (service) {
      values.push(service);
      query += ` AND service = $${values.length}`;
    }

    query += ` ORDER BY id ASC`;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      numbers: result.rows
    });

  } catch (error) {
    console.error("Available numbers error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load available numbers."
    });
  }
});
// ================= PURCHASE NUMBER =================

app.post("/purchase-number", authenticateToken, async (req, res) => {

    const { number_id } = req.body;

    // TEST PRICE FOR NOW
    // This is in the same currency as your wallet balance.
    const price = 5.00;

    if (!number_id) {
        return res.status(400).json({
            success: false,
            message: "Number ID is required."
        });
    }

    const client = await pool.connect();

    try {

        const userId = req.user.userId;

        // Start transaction
        await client.query("BEGIN");

        // Lock the selected number
                const numberResult = await client.query(
                        `
            SELECT id, phone_number, country, service, status
            FROM numbers
            WHERE id = $1
              AND status = 'available'
            FOR UPDATE
                        `,
            [number_id]
        );

        // Number is unavailable
        if (numberResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "This number is no longer available."
            });
        }

        const number = numberResult.rows[0];

        // Lock user's wallet row
        const userResult = await client.query(
            `
            SELECT id, wallet_balance
            FROM users
            WHERE id = $1
            FOR UPDATE
            `,
            [userId]
        );

        if (userResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const walletBalance =
            Number(userResult.rows[0].wallet_balance);

        // Check wallet
        if (walletBalance < price) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "Insufficient wallet balance."
            });
        }

        // Deduct wallet balance
        const walletUpdate = await client.query(
            `
            UPDATE users
            SET wallet_balance = wallet_balance - $1
            WHERE id = $2
            RETURNING wallet_balance
            `,
            [price, userId]
        );

        // Assign number to user
        const purchasedNumber = await client.query(
            `
            UPDATE numbers
            SET
                user_id = $1,
                status = 'active'
            WHERE id = $2
            RETURNING
                id,
                phone_number,
                country,
                service,
                status,
                created_at
            `,
            [userId, number.id]
        );

        // Complete transaction
        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Number purchased successfully!",
            number: purchasedNumber.rows[0],
            price: price,
            wallet_balance: walletUpdate.rows[0].wallet_balance
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error("Purchase number error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to purchase number."
        });

    } finally {

        client.release();

    }
});
// ================= INCOMING SMS =================

app.post("/sms/incoming", async (req, res) => {
  try {
    const { phone_number, sender, message } = req.body;

    if (!phone_number || !message) {
      return res.status(400).json({
        message: "Phone number and message are required."
      });
    }

    // Find the number in our system
    const numberResult = await pool.query(
      `SELECT id, user_id
       FROM numbers
       WHERE phone_number = $1
       LIMIT 1`,
      [phone_number]
    );

    if (numberResult.rows.length === 0) {
      return res.status(404).json({
        message: "Number not found."
      });
    }

    const number = numberResult.rows[0];

    // Try to extract a verification code from the SMS
    const otpMatch = message.match(/\b\d{4,8}\b/);
    const otp = otpMatch ? otpMatch[0] : null;

    // Save SMS
    const result = await pool.query(
      `INSERT INTO sms_messages
       (number_id, sender, message, otp, status)
       VALUES ($1, $2, $3, $4, 'received')
       RETURNING id, number_id, sender, message, otp, status, created_at`,
      [
        number.id,
        sender || "Unknown",
        message,
        otp
      ]
    );

    res.json({
      message: "SMS received successfully.",
      sms: result.rows[0]
    });

  } catch (error) {
    console.error("Incoming SMS error:", error);

    res.status(500).json({
      message: "Unable to receive SMS."
    });
  }
});
// ==================== SMS / OTP ENGINE ====================

// Receive an incoming SMS
app.post("/sms/receive", async (req, res) => {
    try {
        const { phone_number, message, service } = req.body;

        if (!phone_number || !message) {
            return res.status(400).json({
                success: false,
                message: "Phone number and SMS message are required."
            });
        }

        // Find the active number
        const numberResult = await pool.query(
            `SELECT id, user_id, phone_number, service
             FROM numbers
             WHERE phone_number = $1
             AND status = 'active'
             ORDER BY id DESC
             LIMIT 1`,
            [phone_number]
        );

        if (numberResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Number not found or inactive."
            });
        }

        const number = numberResult.rows[0];

        // Try to extract a numeric OTP from the SMS
        const otpMatch = message.match(/\b\d{4,8}\b/);
        const otpCode = otpMatch ? otpMatch[0] : null;

        // Save SMS
        const smsResult = await pool.query(
            `INSERT INTO sms_messages
            (number_id, user_id, phone_number, service, message, otp_code, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'received')
            RETURNING *`,
            [
                number.id,
                number.user_id,
                number.phone_number,
                service || number.service,
                message,
                otpCode
            ]
        );

        console.log("================================");
        console.log("INCOMING SMS");
        console.log("Number:", phone_number);
        console.log("Service:", service || number.service);
        console.log("Message:", message);
        console.log("OTP:", otpCode || "No OTP detected");
        console.log("================================");

        res.json({
            success: true,
            message: "SMS received successfully.",
            sms: smsResult.rows[0]
        });

    } catch (error) {
        console.error("SMS receive error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to process incoming SMS."
        });
    }
});


// Get SMS messages for the logged-in user's numbers
app.get("/sms/messages", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                id,
                phone_number,
                service,
                message,
                otp_code,
                status,
                verified,
                received_at,
                verified_at
             FROM sms_messages
             WHERE user_id = $1
             ORDER BY id DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            messages: result.rows
        });

    } catch (error) {
        console.error("Get SMS error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load SMS messages."
        });
    }
});


// Get the latest OTP for a specific number
app.get("/otp/:phone_number", authenticateToken, async (req, res) => {
    try {
        const { phone_number } = req.params;

        const result = await pool.query(
            `SELECT
                id,
                phone_number,
                service,
                message,
                otp_code,
                status,
                verified,
                received_at
             FROM sms_messages
             WHERE phone_number = $1
             AND user_id = $2
             ORDER BY id DESC
             LIMIT 1`,
            [phone_number, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: true,
                waiting: true,
                message: "Waiting for SMS..."
            });
        }

        res.json({
            success: true,
            waiting: false,
            sms: result.rows[0]
        });

    } catch (error) {
        console.error("OTP fetch error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve OTP."
        });
    }
});


// Verify OTP
app.post("/otp/verify", authenticateToken, async (req, res) => {
    try {
        const { phone_number, otp } = req.body;

        if (!phone_number || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone number and OTP are required."
            });
        }

        const result = await pool.query(
            `SELECT id, otp_code
             FROM sms_messages
             WHERE phone_number = $1
             AND user_id = $2
             AND verified = FALSE
             ORDER BY id DESC
             LIMIT 1`,
            [phone_number, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No pending OTP found."
            });
        }

        const sms = result.rows[0];

        if (String(sms.otp_code) !== String(otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP."
            });
        }

        await pool.query(
            `UPDATE sms_messages
             SET verified = TRUE,
                 status = 'verified',
                 verified_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [sms.id]
        );

        res.json({
            success: true,
            message: "OTP verified successfully.",
            verified: true
        });

    } catch (error) {
        console.error("OTP verification error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to verify OTP."
        });
    }
});
// ================= FUND WALLET =================

app.post("/fund-wallet", authenticateToken, async (req, res) => {
        try {
                const { amount, phoneNumber } = req.body;
                const fundingAmount = Number(amount);

                if (!Number.isFinite(fundingAmount) || fundingAmount < 1000 || fundingAmount > 1000000) {
                        return res.status(400).json({ success: false, message: "Enter an amount between ₦1,000 and ₦1,000,000." });
                }

                if (!hasLivePagaConfiguration()) {
                        return res.status(503).json({
                                success: false,
                                message: "Live payments are not configured. Add the Paga credentials, charge URL, and public HTTPS backend URL."
                        });
                }

                const userResult = await pool.query(
                        "SELECT id, full_name, email FROM users WHERE id = $1",
                        [req.user.userId]
                );
                if (userResult.rows.length === 0) {
                        return res.status(404).json({ success: false, message: "User not found." });
                }

                const user = userResult.rows[0];
                const referenceNumber = `WP${crypto.randomUUID().replaceAll("-", "")}`;
                const checkoutUrl = createPagaCheckoutUrl({
                        referenceNumber,
                        amount: fundingAmount,
                        email: user.email,
                        phoneNumber
                });

                await pool.query(
                        `INSERT INTO transactions
                         (user_id, reference_number, amount, type, status)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [req.user.userId, referenceNumber, fundingAmount, "wallet_funding", "pending"]
                );

                console.log("LIVE Paga checkout created", { referenceNumber, amount: fundingAmount });
                return res.json({ success: true, referenceNumber, checkoutUrl });
        } catch (error) {
                console.error("Fund wallet error:", error);
                return res.status(500).json({ success: false, message: "Unable to create funding request." });
        }
});

app.post("/paga/callback", async (req, res) => {
        const payload = req.body || {};

        try {
                if (!process.env.PAGA_HASH_KEY || !isValidPagaCallbackHash(payload)) {
                        console.error("Rejected Paga callback: invalid hash or missing configuration.");
                        return res.status(401).json({ status: "REJECTED" });
                }

                if (String(payload.statusCode) !== "0") {
                        console.log("Paga callback indicates unsuccessful payment", {
                                paymentReference: payload.paymentReference,
                                statusCode: payload.statusCode
                        });
                        return res.json({ status: "SUCCESS" });
                }

                const paymentReference = String(payload.paymentReference);
                const callbackAmount = Number(payload.amount);
                const verification = await verifyPagaCharge(paymentReference, callbackAmount);
                const verifiedStatus = String(verification.status_code ?? verification.statusCode);
                const verifiedAmount = Number(verification.amount ?? verification.requestAmount);

                if (verifiedStatus !== "0" || !Number.isFinite(verifiedAmount) || verifiedAmount !== callbackAmount) {
                        console.error("Rejected Paga callback: verification mismatch", { paymentReference, verification });
                        return res.status(400).json({ status: "REJECTED" });
                }

                const client = await pool.connect();
                try {
                        await client.query("BEGIN");
                        const transaction = await client.query(
                                `SELECT id, user_id, amount, status
                                 FROM transactions
                                 WHERE reference_number = $1
                                 FOR UPDATE`,
                                [paymentReference]
                        );

                        if (transaction.rows.length === 0) {
                                await client.query("ROLLBACK");
                                return res.status(404).json({ status: "REJECTED" });
                        }

                        const pendingTransaction = transaction.rows[0];
                        if (pendingTransaction.status !== "pending") {
                                await client.query("ROLLBACK");
                                return res.json({ status: "SUCCESS" });
                        }

                        if (Number(pendingTransaction.amount) !== callbackAmount) {
                                await client.query("ROLLBACK");
                                return res.status(400).json({ status: "REJECTED" });
                        }

                        await client.query(
                                `UPDATE users
                                 SET wallet_balance = wallet_balance + $1
                                 WHERE id = $2`,
                                [callbackAmount, pendingTransaction.user_id]
                        );
                        await client.query(
                                `UPDATE transactions
                                 SET status = $1
                                 WHERE id = $2`,
                                ["successful", pendingTransaction.id]
                        );
                        await client.query("COMMIT");
                        return res.json({ status: "SUCCESS" });
                } catch (error) {
                        await client.query("ROLLBACK");
                        throw error;
                } finally {
                        client.release();
                }
        } catch (error) {
                console.error("Paga callback error:", error);
                return res.status(500).json({ status: "REJECTED" });
        }
});
// ================= START SERVER =================

app.listen(PORT, () => {

    console.log(
        `WisdomProSMS backend running on http://localhost:${PORT}`
    );

});