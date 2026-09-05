# Paga Collect Nodejs API Library v1.1.6

## Paga Collect Services exposed by the library

- paymentRequest
- getBanks
- paymentStatus
- paymentHistory
- registerPersistentPaymentAccount

For more information on the services listed above, visit the [Paga DEV website](https://mypaga.readme.io/docs/node-library-2)

## How to use

`npm install paga-collect`

```
const PagaCollectClient = require('paga-collect');

const pagaCollectClient = new PagaCollectClient().
                            .setClientId("<publicId>")
                            .setPassword("<secretkey>")
                            .setApiKey("<HMAC>")
                            .setTest(true)
                            .build();
```

As shown above, you set the publicId, apiKey, password given to you by Paga, If you pass true as the value for setIsTest(), the library will use the test url as the base for all calls. Otherwise setting it to false will use the live url value you **pass** as the base.

### Paga Collect Service Functions

**Request Payment**

Registers a new request for payment between a payer and a payee. Once a payment request is initiated successfully, the payer is notified by the platform (this can be suppressed) and can proceed to authorize/execute the payment. Once the payment is fulfilled, a notification is sent to the supplied callback URL.

To make use of this function, call the **paymentRequest** inside PagaCollectClient which will return a JSONObject.

```

let data = {
      "referenceNumber": "53yw19011000009112",
      "amount": 200,
      "callBackUrl": "http://localhost:5000/core/webhook/paga",
      "currency": "NGN",
      "expiryDateTimeUTC": "2021-05-20T19:35:47",
      "isAllowPartialPayments": false,
      "isSuppressMessages": false,
      "payee": {"bankAccountNumber": "XXXXXXXXXXX",
                "bankId": "XXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXX",
                "name": "John Doe",
              "accountNumber": "XXXXXXXXXX"},
      "payer": {"email": "foobar@gmail.com",
                "name": "Foo Bar", 
                "bankId": "XXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXX", 
                "phoneNumber": "XXXXXXXXXXX"},
      "payerCollectionFeeShare": 1.0,
      "recipientCollectionFeeShare": 0.0,
      "paymentMethods": ["BANK_TRANSFER", "FUNDING_USSD"]
      }

  pagaCollectClient.paymentRequest(data).then(resp => {
        console.log(JSON.stringify(resp))
    });
```

**Create Persistent Payment Account**

An operation for business to create Persistent Payment Account Numbers that can be assigned to their customers for payment collection. These account numbers belong to the organization and are assigned to their customers to make payments anytime via Bank or Paga transfers.

To make use of this function, call the ****registerPersistentPaymentAccount**** inside PagaCollectClient which will return a JSONObject.

```

let data = {
      "referenceNumber": "53yw19011000009112",
      "phoneNumber": 07022222222,
      "firstName": "John",
      "lastName": "Doe",
      "accountName": John DOe,
      "financialIdentificationNumber":  22222222222220,
      "accountReference": 2222222222,
      "creditBankId": 40090E2F-7446-4217-9345-7BBAB7043C4C,
      "creditBankAccountNumber": 0000000000,
      "callBackUrl": "http://localhost:5000/core/webhook/paga"
      }

  pagaCollectClient.registerPersistentPaymentAccount(data).then(resp => {
        console.log(JSON.stringify(resp))
    });
```

**Get Banks**

Retrieve a list of supported banks and their complementary unique ids on the bank. This is required for populating the payer (optional) and payee objects in the payment request model.
To make use of this function, call the **getBanks** inside PagaCollectClient which will return a JSONObject.

```
let data = {referenceNumber:'529383853031111'}
    pagaCollectClient.getBanks(data).then(resp => {
        console.log(JSON.stringify(resp))
    });
  
   
```

**Query Payment Request Status**

Query the current status of a submitted payment request.
To make use of this function, call the **paymentStatus** inside PagaCollectClient which will return a JSONObject.

```
let data = {referenceNumber:'529383853031111'}
    pagaCollectClient.paymentStatus(data).then(resp => {
        console.log(JSON.stringify(resp))
    });
```

**Payment Request History**

Get payment requests for a period between to give start and end dates. The period window should not exceed 1 month.
To make use of this function, call the **paymentHistory** inside PagaCollectClient which will return a JSONObject.

```
let data = {
      referenceNumber : "82353464000000",
      startDateTimeUTC : "2021-04-19T19:15:22",
      endDateTimeUTC : "2021-05-18T19:15:22"
  
    }

 pagaCollectClient.paymentHistory(data).then(resp => {
        console.log(JSON.stringify(resp))
    });
```

**Update Persistent Payment Account**

This endpoint allows for changing any of the account properties except the **accountNumber (NUBAN)** and the **accounReference** properties which cannot be changed.
To make use of this function, call the **updatePersistentPaymentAccount** inside PagaCollectClient which will return a JSONObject.

```
   let data = {
        referenceNumber: uuidv4(),
        accountIdentifier: "0013188322",
        firstName: "Shane",
        lastName: "Moss",

    }

 pagaCollectClient.updatePersistentPaymentAccount(data).then(resp => {
        console.log(JSON.stringify(resp))
    });
```

**Get Persistent Payment Account**

A method to query the properties associated with an existing persistent payment account.

To make use of this function, call the **getPersistentPaymentAccount** inside PagaCollectClient which will return a JSONObject.

```
 let data = {
        referenceNumber: uuidv4(),
        accountIdentifier: "0013188322",

    }

 pagaCollectClient.getPersistentPaymentAccount(data).then(resp => {
        console.log(JSON.stringify(resp))
    });
```

**Delete Persistent Payment Account**

This endpoint allows for deleting a persistent payment account.

To make use of this function, call the **deletePersistentPaymentAccount** inside PagaCollectClient which will return a JSONObject.

```

    let data = {
        referenceNumber: uuidv4(),
        accountIdentifier: "0013188322"

    }

 pagaCollectClient.deletePersistentPaymentAccount(data).then(resp => {
        console.log(JSON.stringify(resp))
    });
```

**Payment Request Refund**

This end-point can be used to either cancel or initiate a refund if we were unable to fulfill the request for one reason or the other.

To make use of this function, call the **paymentRequestRefund** inside PagaCollectClient which will return a JSONObject.

```

   let data = {
        referenceNumber: "e38a59d2-ea69-456f-8b82-4a9288c83bf3",
        refundAmount: 2000,
        currency: "NGN",
        accountIdentifier: "1030850838"

    }

 pagaCollectClient.paymentRequestRefund(data).then(resp => {
        console.log(JSON.stringify(resp))
    });
```
