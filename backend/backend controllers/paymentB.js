var braintree = require("braintree");

var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    // Use your own credentials from the sandbox Control Panel here
    merchantId: 'tmhvwxqfkxwfdjnp',
    publicKey: 'fnzjthqzz3g965n8',
    privateKey: 'c2122001c69477aeb52efdef1b523f5a'
  });

  exports.getToken = (req,res) =>{
    gateway.clientToken.generate({}, function (err, response) {
       if(err){
           res.status(500).send(err)
       }else{
           res.send(response)
       }
      });

}
 exports.processPayment = (req,res) => {

    let nonceFromTheClient =req.body.paymentMethodNonce

    let amountFromTheClient= req.body.amount

    gateway.transaction.sale({
        amount: amountFromTheClient,
        paymentMethodNonce: nonceFromTheClient,

      
        options: {
          submitForSettlement: true
        }
      }, function (err, result) {
          if(err){
              res.status(500).json(error)
          }
          else{
              res.json(result)
          }
      });

 }