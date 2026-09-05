
const Builder = require("./PagaCollectClient");
const UtilFunction = require("./UtilFunction");

class PagaCollect extends UtilFunction {

    constructor(build) {
        super(build)
    }

    /**
     * @param   {Object}  data              Request object
     * @param   {string}  data.referenceNumber - A unique reference number representing this request. The same reference number will be returned in the response.
     *
     * @returns {Promise< {"error":false,
     *                    "response": {
     *                    "referenceNumber" : "12345",
     *                    "statusCode" : "0",
     *                    "statusMessage" : "success", 
     *                    "banks" : [
     *                      {
     *                          "name" : "GT Bank",
     *                          "uuid" : "3E94C4BC-6F9A-442F-8F1A-8214478D5D86"
     *                      },
     *                      {
     *                          "name" : "Access Bank",
     *                          "uuid" : "F8F3EFBF-67CB-4C17-A079-B7CFE95F71BE"
     *                     }
     *                    ]
     *                     },
     *                }>}  Get banks account response
     *
     *
     *
     */
    async getBanks(data) {
        try {
            const {
                referenceNumber
            } = data;
            let requestData = {
                referenceNumber
            }
            console.log(requestData);

            let header = this.buildHeader(referenceNumber);
            let response = await this.postRequest(header, requestData, this.getBaseUrl(ENDPOINT.BANKS));
            // @ts-ignore
            return this.checkError(response);

        } catch (err) {
            console.log(err);
        }

    }


    /**
     * @param   {Object}  data              Request object
     * @param   {string}  data.referenceNumber -    A unique reference number representing this request. The same reference number will be returned in the response and can be used to query the payment request status
     * @param   {number}  data.amount               The amount being requested
     * @param   {string}  data.currency             The currency of the operation, only required if being executed in a foreign currency
     * @param   {Object}  data.payer                The person/entity from whom we are requesting a payment
     * @param   {string=}  data.payer.email          E-mail address of the payer. Either one of phone-number or e-mail address must be provided
     * @param   {string}  data.payer.name           Name of the payer.
     * @param   {string=}  data.payer.bankId         PublicId/PublicKey representing the payer’s bank. This is used for filtering payment option configuration presented to the payer. Available from the getBanks request.
     * @param   {string=}  data.payer.phoneNumber    Phone number of the payer. Either one of phone-number or e-mail address must be provided
     * @param   {Object}  data.payee                The person/entity to receive the payment, if the payee identifier (eg. phone number, email, etc.) is not supplied, the payment request processor is automatically selected as recipient
     * @param   {string=}  data.payee.bankAccountNumber    For payments to traditional bank accounts. On fulfilment, processed funds will be paid into this account. Must be provided for non-paga recipient.
     * @param   {string=}  data.payee.bankId               PublicId/PublicKey representing the recipient’s bank (if not Paga). Must be provided for non-paga recipient.
     * @param   {string}  data.payee.name            Name of the recipient
                                                     It would be important to note that the name that shows up for the Payer (eg. when doing a name enquiry at a bank), is what you provide in the payee.name parameter by default
     * @param   {string=}  data.payee.phoneNumber     The recipient’s registered phone-number on Paga. Either is value of the account number (NUBAN) must be provided for processing payment into a paga account.
     * @param   {string=}  data.payee.accountNumber   The recipient’s Paga account number (NUBAN) for receiving payments
     * @param   {string=} data.payee.financialIdentificationNumber  Bank Verification Number (BVN) of the recipient
     * @param   {string=}  data.expiryDateTimeUTC     Time limit for the payment request to be fulfilled otherwise it will be automatically expired, this must be with one week of requesting payment. If not provided the default expiry window value is applied.
     * @param   {boolean}  data.isSuppressMessages     Suppress direct messaging to payer and recipient. Default value is false
     * @param   {number}  data.payerCollectionFeeShare This represents the percentage of the payment request fee that will be charged to the payer. The combination of payerCollectionFeeShare and recipientCollectionFeeShare must be less than 1.0
     * @param   {number}  data.payeeCollectionFeeShare   This represents the percentage of the payment request fee that will be charged to the payee. The combination of payerCollectionFeeShare and payeeCollectionFeeShare must be less than 1.0
     * @param   {boolean=}  data.isAllowPartialPayments    Boolean flag indicating whether or not to accept partial payments for the payment request. Default value is false
     * @param   {string}  data.callBackUrl                The callback url that will be notified with updates on the payment request status
     * @param   {Array<string>}  data.paymentMethods       List of permitted payment methods for processing this request
     * @param   {boolean=}  data.displayBankDetailToPayer    This displays the bank details of the payer (bank name and account number) in addition to the payee.name to the payee.
     * 
     * 
     * 
     *
     * @returns {Promise< {"error":false,
     *                    "response": {
     *                    "referenceNumber" : "12345",
     *                    "statusCode" : "0",
     *                    "statusMessage" : "success", 
     *                    "paymentMethods" : [
     *                      {
     *                          "name" : "BANK_TRANSFER",
     *                         "properties" : {
     *                          "paymentCode" : "12345678"
     *                         }
     *                      },
     *                    
     *                    ],
     *                    "expiryDateTimeUTC" : null,
     *                    "payerPagaAccountHolder" : false
     *                     },
     *                }>}  Payment Request response
     *
     *
     *
     */
    async paymentRequest(data) {

        try {
            const {
                referenceNumber,
                amount,
                currency = "NGN",
                payer,
                payee,
                expiryDateTimeUTC = null,
                isSuppressMessages,
                payerCollectionFeeShare,
                payeeCollectionFeeShare,
                isAllowPartialPayments = null,
                callBackUrl,
                paymentMethods,
                displayBankDetailToPayer = null
            } = data;

            const payerDetails = {

                email: payer.email || null,
                name: payer.name,
                bankId: payer.bankId || null,
                phoneNumber: payer.phoneNumber || null


            }

            const payeeDetails = {
                bankAccountNumber: payee.bankAccountNumber || null,
                bankId: payee.bankId || null,
                name: payee.name,
                phoneNumber: payee.phoneNumber || null,
                accountNumber: payee.accountNumber || null,
                financialIdentificationNumber: payee.financialIdentificationNumber || null


            }


            let requestData = {
                referenceNumber,
                amount,
                currency,
                payer: payerDetails,
                payee: payeeDetails,
                expiryDateTimeUTC,
                isSuppressMessages,
                payerCollectionFeeShare,
                payeeCollectionFeeShare,
                isAllowPartialPayments,
                callBackUrl,
                paymentMethods,
                displayBankDetailToPayer
            }

            console.log(requestData)

            let hashObj = {
                referenceNumber,
                amount,
                currency,
                payerPhoneNumber: payerDetails.phoneNumber,
                payerEmail: payerDetails.email,
                payeeAccountNumber: payeeDetails.accountNumber,
                payeePhoneNumber: payeeDetails.phoneNumber,
                payeeBankId: payeeDetails.bankId,
                payeeBankAccountNumber: payeeDetails.bankAccountNumber

            }

            console.log(hashObj);
            let hashParams = Object.values(this.filterOptionalFields(hashObj)).join("");
            console.log(hashParams);
            let header = this.buildHeader(hashParams);
            let response = await this.postRequest(header, this.filterOptionalFields(requestData), this.getBaseUrl(ENDPOINT.PAYMENT_REQUEST));
            // @ts-ignore
            return this.checkError(response);


        } catch (err) {
            throw new Error(err)
        }
    }


    /**
     * @param   {Object}  data              Request object
     * @param   {string}  data.referenceNumber - A unique reference number representing the operation that is being queried
     *
     * @returns {Promise< {"error":false,
     *                    "response": {
     *                    "referenceNumber" : "12345",
     *                    "statusCode" : "0",
     *                    "statusMessage" : "success", 
     *                    "paymentMethods" : [
     *                      {
     *                          "name" : "BANK_TRANSFER",
     *                         "properties" : {
     *                          "paymentCode" : "12345678"
     *                         }
     *                      },
     *                    
     *                    ],
     *                    "expiryDateTimeUTC" : null,
     *                    "payerPagaAccountHolder" : false
     *                     },
     *                }>}  Payment Status response
     *
     *
     *
     */
    async paymentStatus(data) {
        try {
            const {
                referenceNumber,

            } = data;

            let requestData = {
                referenceNumber,

            }
            console.log(requestData);

            let header = this.buildHeader(referenceNumber);

            console.log(this.getBaseUrl("status"));

            let response = await this.postRequest(header, requestData, this.getBaseUrl(ENDPOINT.STATUS));
            console.log(response);
            // @ts-ignore
            return this.checkError(response);
        } catch (err) {
            throw new Error(err);

        }
    }

    /**
     * @param   {Object}  data              Request object
     * @param   {string=}  data.referenceNumber - A unique reference number representing a request. If provided, it will restrict results to only those tied to the request with that specific reference numbe
     * @param   {string}  data.startDateTimeUTC - A timestamp representing the start of the transaction history request. Range must be less than or equal to 3 months
     * @param   {string}  data.endDateTimeUTC - A timestamp representing the end of the transaction history request. Range must be less than or equal to 3 months
     *
     * @returns {Promise< {"error":false,
     *                    "response": {
     *                    "referenceNumber" : "12345",
     *                    "statusCode" : "0",
     *                    "statusMessage" : "success", 
     *                    "itemCount": 2,
     * "items": [       
     *   {
     *        "datetime": "2021-09-04T15:51:01.417",
     *        "referenceNumber": "235346458804",
     *        "accountNumber": "0515545692",
     *        "accountReference": null,
     *         "operation": "PAYMENT_REQUEST",
     *        "action": "CREATE_REQUEST",
     *        "amount": 7048.38,
     *        "status": "SUCCESSFUL"
     *    },
     *    {
     *        "datetime": "2021-09-08T12:26:57.147",
     *        "referenceNumber": "2340235987988000",
     *        "accountNumber": "0301657073",
     *        "accountReference": "000000000014",
     *        "operation": "PERSISTENT_PAYMENT_ACCOUNT",
     *        "action": "CREATE",
     *        "amount": 0.0,
     *        "status": "SUCCESSFUL"
     *    }]
     * }
     *                }>}  Payment History response
     *
     *
     *
     */
    async paymentHistory(data) {
        try {
            const {
                referenceNumber,
                startDateTimeUTC,
                endDateTimeUTC
            } = data;

            let requestData = {
                referenceNumber,
                startDateTimeUTC,
                endDateTimeUTC
            }
            console.log(requestData);

            let header = this.buildHeader(referenceNumber);

            console.log(this.getBaseUrl("history"));

            let response = await this.postRequest(header, requestData, this.getBaseUrl(ENDPOINT.HISTORY));
            console.log(response);
            // @ts-ignore
            return this.checkError(response);
        } catch (err) {
            throw new Error(err);

        }
    }

    /**
     * @param   {Object}  data              Request object
     * @param   {string}  data.referenceNumber - The unique reference number representing the update persistent payment account request.
     * @param   {string}  data.accountIdentifier - The accountIdentifier can be either the NUBAN or the accountReference that was provided when creating the persistent payment account
     * @param   {string=}  data.phoneNumber          The customer's Bank verification Number (BVN)
     * @param   {string=}  data.firstName           The first name of the customer
     * @param   {string=}  data.lastName           The last name of the customer
     * @param   {string=}  data.accountName        The acountname of the customer.
     * @param   {string=}  data.financialIdentificationNumber   The customer's Bank verification Number (BVN)
     * @param   {string=}  data.creditBankId              If included, this is the public Id of the bank that you want deposits to be transferred directly to fo every payment.
     * @param   {string=}  data.creditBankAccountNumber   This must be provided if creditBankId is included in the request payload. It is the bank account number of the bank that you want deposits to be transferred to. This must be a valid account number for the bank specified by creditBankId
     * @param   {string=}  data.callbackUrl             A custom callback URL for the payment webhook notifications for this specific account to be sent to. If provided, requests are sent to this URL exactly as provided. This allows you to set custom query parameters to the URL which you will be provided during webhook notifications for this specific account.
     *
     * @returns {Promise< {"error":false,
     *                    "response": {
     *                    "response" :0, 
     *                    "message": null, 
     *                    "referenceNumber": "0053459875439143453000", 
     *                    "accountReference": "123467891334",
     *                    "accountNumber": "3414743183"},
     *                    "message":""
     *                }>}  Update persistent payment account response
     *
     *
     *
     */
    async updatePersistentPaymentAccount(data) {
        try {
            const {
                referenceNumber,
                accountIdentifier,
                phoneNumber = null,
                firstName = null,
                lastName = null,
                accountName = null,
                financialIdentificationNumber = null,
                callbackUrl = null,
                creditBankId = null,
                creditBankAccountNumber = null
            } = data;

            let requestData = {
                referenceNumber,
                accountIdentifier,
                phoneNumber,
                firstName,
                lastName,
                accountName,
                financialIdentificationNumber,
                callbackUrl,
                creditBankId,
                creditBankAccountNumber
            }
            console.log(requestData);

            const hashObj = {
                referenceNumber,
                accountIdentifier,
                creditBankId,
                creditBankAccountNumber,
                callbackUrl
            }

            const hashParams = Object.values(this.filterOptionalFields(hashObj)).join("");
            const filterOptionalRequestFields = this.filterOptionalFields(requestData);
            console.log(filterOptionalRequestFields);

            let header = this.buildHeader(hashParams);

            let response = await this.postRequest(header, filterOptionalRequestFields, this.getBaseUrl(ENDPOINT.UPDATE_PERSISTENT_PAYMENT_ACCOUNT));
            console.log(response);
            // @ts-ignore
            return this.checkError(response);
        } catch (err) {
            throw new Error(err);

        }
    }

    /**
     * @param   {Object}  data              Request object
     * @param   {string}  data.referenceNumber - The unique reference number representing the update persistent payment account request.
     * @param   {string}  data.accountIdentifier - The accountIdentifier can be either the NUBAN or the accountReference that was provided when creating the persistent payment account
     * @param   {string=}  data.reason          Reason for deleting the account
     *
     * @returns {Promise< {"error":false,
     *                    "response": {
     *                    "response" :0, 
     *                    "statusMessage": "success" },
     *                }>}  Delete persistent payment account response
     *
     *
     *
     */

    async deletePersistentPaymentAccount(data) {
        try {
            const {
                referenceNumber,
                accountIdentifier,
                reason = null
            } = data;

            let requestData = {
                referenceNumber,
                accountIdentifier,
                reason
            }
            console.log(requestData);

            const hashObj = {
                referenceNumber,
                accountIdentifier
            }

            const hashParams = Object.values(hashObj).join("");

            let header = this.buildHeader(hashParams);

            let response = await this.postRequest(header, this.filterOptionalFields(requestData), this.getBaseUrl(ENDPOINT.DELETE_PERSISTENT_PAYMENT_ACCOUNT));
            // @ts-ignore
            return this.checkError(response);
        } catch (err) {
            throw new Error(err);

        }
    }

    /**
     * @param   {Object}  data              Request object
     * @param   {string}  data.referenceNumber - A unique reference number provided by the business, identifying the transaction. This reference number will be preserved on the Paga platform to reconcile the operation across systems and will be returned in the response.
     * @param   {string}  data.phoneNumber       The customer's phone number
     * @param   {string}  data.email             The customer's email
     * @param   {string}  data.firstName                      The currency of the operation, if being executed in a foreign currency.
     * @param   {string}  data.lastName           The account identifier for the recipient receiving the money transfer. This account identifier may be a phone number, account nickname, or any other unique account identifier supported by the Paga platform. If destinationBank is specified, this is the bank account number.
     * @param   {string}  data.accountName               For money transfers to a bank account, this is the destination bank code.
     * @param   {string}  data.financialIdentificationNumber    The customer's Bank verification Number (BVN)
     * @param   {string}  data.accountReference              The authentication credentials for the user sending money if the money is being sent on behalf of a user
     * @param   {string=}  data.creditBankId                  public Id of the bank that you want deposits to be transferred directly to fo every payment.
     * @param   {string=}  data.creditBankAccountNumber       This must be provided if creditBankId is included in the request payload. It is the bank account number of the bank that you want deposits to be transferred to. This must be a valid account number for the bank specified by creditBankId
     * @param   {string=}  data.callbackUrl                   A custom callback URL for the payment webhook notifications for this specific account to be sent to. If provided, requests are sent to this URL exactly as provided. This allows you to set custom query parameters to the URL which you will be provided during webhook notifications for this specific account.
     *
     * @returns {Promise< {"error":false,
     *                    "response": {
     *                    "response" :0, 
     *                    "message": null, 
     *                    "referenceNumber": "0053459875439143453000", 
     *                    "accountReference": "123467891334",
     *                    "accountNumber": "3414743183"},
     *                }>}  Register persistent payment account response
     *
     *
     *
     */
    async registerPersistentPaymentAccount(data) {
        try {
            const {
                referenceNumber,
                phoneNumber,
                email,
                firstName,
                lastName,
                accountName,
                financialIdentificationNumber,
                accountReference,
                creditBankId = null,
                creditBankAccountNumber = null,
                callbackUrl = null,
            } = data;

            let requestData = {
                referenceNumber,
                phoneNumber,
                email,
                firstName,
                lastName,
                accountName,
                financialIdentificationNumber,
                accountReference,
                creditBankId,
                creditBankAccountNumber,
                callbackUrl,
            };

            const hashObj = {
                referenceNumber,
                accountReference,
                financialIdentificationNumber,
                creditBankId,
                creditBankAccountNumber,
                callbackUrl,
            };

            let hashParams = Object.values(this.filterOptionalFields(hashObj)).join(
                ""
            );
            let header = this.buildHeader(hashParams);
            let response = await this.postRequest(
                header,
                this.filterOptionalFields(requestData),
                this.getBaseUrl(ENDPOINT.REGISTER_PERSISTENT_PAYMENT_ACCOUNT)
            );
            // @ts-ignore
            return this.checkError(response);
        } catch (error) {
            throw new Error(error);
        }
    }


    /**
     * @param   {Object}  data              Request object
     * @param   {string}  data.referenceNumber - The unique reference number representing the payment request to be refunded.
     * @param   {number}  data.refundAmount       Amount to be refunded.
     * @param   {string}  data.currency          The currency of the operation.
     * @param   {string=}  data.reason           Reason for the refund request
     *
     * @returns {Promise< {"error":false,
     *                    "response": {
     *                    "referenceNumber" : "12345",
     *                    "statusCode" : "0",
     *                    "statusMessage" : "success", 
     *                    "refundAmount" : 1000.0,
     *                    "accountNumber": "3414743183",
     *                    "currency" : "NGN",
     *                    "refundDestination" : "Paga | 00012346433"
     *                     },
     *                }>}  Payment Request Refund payment account response
     *
     *
     *
     */
    async paymentRequestRefund(data) {
        try {
            const {
                referenceNumber,
                refundAmount,
                currency,
                reason = null,

            } = data;

            let requestData = {
                referenceNumber,
                refundAmount,
                currency,
                reason
            };

            const hashObj = {
                referenceNumber,
                refundAmount
            };

            let hashParams = Object.values(this.filterOptionalFields(hashObj)).join(
                ""
            );
            let header = this.buildHeader(hashParams);
            let response = await this.postRequest(
                header,
                this.filterOptionalFields(requestData),
                this.getBaseUrl(ENDPOINT.REFUND)
            );
            // @ts-ignore
            return this.checkError(response);
        } catch (error) {
            throw new Error(error);
        }
    }


    /**
     * @param   {Object}  data              Request object
     * @param   {string}  data.referenceNumber - The unique reference number representing the payment request to be refunded.
     * @param   {string}  data.accountIdentifier  The accountIdentifier can be either the NUBAN or the accountReference the customer provided when creating the account
     *
     * @returns {Promise< {"error":false,
     *                    "response": {
     *                    "referenceNumber" : "12345",
     *                    "statusCode" : "0",
     *                    "statusMessage" : "success", 
     *                    "accountReference": "000000000039",
     *                    "accountNumber": "3414743183",
     *                    "accountName": "Jermey Doe",
     *                    "phoneNumber": "08163232123",
     *                    "firstName": "Jermey",
     *                    "lastName": "Doe",
     *                    "financialIdentificationNumber": "12345454325",
     *                    "creditBankId": "1",
     *                    "creditBankAccountNumber": "0000000000",
     *                    "callbackUrl": "http://www.example.com/persistent/000000000008/Password10"
     *                     },
     *                }>}  Get Persistent payment account response
     *
     *
     *
     */
    async getPersistentPaymentAccount(data) {
        try {
            const {
                referenceNumber,
                accountIdentifier,

            } = data;

            let requestData = {
                referenceNumber,
                accountIdentifier
            };

            const hashObj = {
                referenceNumber,
                accountIdentifier
            };

            let hashParams = Object.values(this.filterOptionalFields(hashObj)).join(
                ""
            );
            let header = this.buildHeader(hashParams);
            let response = await this.postRequest(
                header,
                this.filterOptionalFields(requestData),
                this.getBaseUrl(ENDPOINT.GET_PERSISTENT_PAYMENT_ACCOUNT)
            );
            // @ts-ignore
            return this.checkError(response);
        } catch (error) {
            throw new Error(error);
        }
    }


    static Builder() {

        return new Builder();
    }

}

const ENDPOINT = {
    BANKS: "banks",
    PAYMENT_REQUEST: "paymentRequest",
    STATUS: "status",
    HISTORY: "history",
    UPDATE_PERSISTENT_PAYMENT_ACCOUNT: "updatePersistentPaymentAccount",
    DELETE_PERSISTENT_PAYMENT_ACCOUNT: "deletePersistentPaymentAccount",
    REGISTER_PERSISTENT_PAYMENT_ACCOUNT: "registerPersistentPaymentAccount",
    REFUND: "refund",
    GET_PERSISTENT_PAYMENT_ACCOUNT: "getPersistentPaymentAccount"



}









module.exports = PagaCollect;