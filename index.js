import inquirer from "inquirer"
import chalk from "chalk"
 
import fs from "fs"

operation()

function operation () {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: [
          'Criar Conta',
          'Consultar Saldo',
          'Depositar',
          'Sacar',
          'Transferência',
          'Empréstimo',
          'Cheque Especial',
          'Sair',        
        ]
      },
    ])
  .then((answer) => {
    const action = answer['action']

    if(action === 'Criar Conta') {
      createAccount()
    } else if(action === 'Consultar Saldo') {
      getAccountBalance()
    } else if(action === 'Depositar') {
      deposit()
    } else if(action === 'Sacar') {
      withdraw()
    } else if(action === 'Transferência') {
      transfer()
    } else if(action === 'Empréstimo') {
      loan()
    } else if(action === 'Cheque Especial') {
      overdraft()
    } else if(action === 'Sair') {
      console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))      
      process.exit()
    }
    
  }).catch((err) => console.log(err))
}

// create an acount
function createAccount() {
  console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'))
  console.log(chalk.green('Defina as opções da sua conta a seguir'))

  buildAccount()
}

function buildAccount(){
  inquirer.prompt([
    {
      name: 'accountName',
      message: 'Digite um nome para a sua conta:',
    },
  ])
  .then((answer) => {
    const accountName = answer['accountName']

    console.info(accountName)

    if (!fs.existsSync('accounts')) {
      fs.mkdirSync('accounts')
    }

    if(fs.existsSync(`accounts/${accountName}.json`)){
      console.log(
        chalk.bgRed.black('Esta conta já existe, escolha outro nome!'),
      )
      buildAccount()
      return //serve para evitar um bug no sistema

    } fs.writeFileSync(
      `accounts/${accountName}.json`,
      '{"balance": 0}',
      function (err) {
        console.log(err)
      },
    )
    console.log(chalk.green('Parabéns, a sua conta foi criada!'))
    operation()
  })
  .catch((err) => console.log(err))
}

// add an amout to user account
function deposit() {

  inquirer.prompt([
    {
      name: 'accountName',
      message: 'Qual o nome da sua conta?'
    }
  ])
  .then((answer) => {

    const accountName = answer['accountName']

    //verify if account exists
    if(!checkAccount(accountName)) {
      return deposit()
    }

    inquirer.prompt([
      {
        name: 'amount',
        message: 'Quanto você deseja depositar',
      },
    ]).then((answer) => {

      const amount = answer['amount']

      //add an amount
      addAmount(accountName, amount)
      operation()

    }).catch((err) => console.log(err))
  })
  .catch((err) => console.log(err))
}

function checkAccount(accountName){
  if(!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black('Esta conta não existe, escolha outro nome!'))
    return false
  }
  return true
}

function addAmount(accountName, amount) {

  const accountData = getAccount(accountName)
  
  if(!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde"),
    )
    return deposit()
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)
  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err)
    },
  )
  console.log(
    chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`),
  )

}

function getAccount(accountName){
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    econding: 'utf8',
    flag: 'r' //essa flag quer dizer que a função só quer ler o arquivo
  })

  return JSON.parse(accountJSON)
}

//show account balance
function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
      },
    ])
    .then((answer) => {
      const accountName = answer['accountName']

      //verify if account exists
      if(!checkAccount(accountName)) {
        return getAccountBalance()
      }

      const accountData = getAccount(accountName)

      console.log(
        chalk.bgBlue.black(
        `Olá, o saldo da sua conta é de R$${accountData.balance}`,
        ),
      )
      operation()
    }).catch((err) => console.log(err))
}

//withdraw an amount from user account
function withdraw() {

  inquirer.prompt([
    {
      name: 'accountName',
      message: 'Qual o nome da sua conta?'
    }]).then((answer) => {

      const accountName = answer['accountName']

      if(!checkAccount(accountName)){
        return withdraw()
      }

      inquirer.prompt([
        {
          name:'amount',
          message: 'Quanto você deseja sacar?'
        }
      ]).then((answer) => {
        const amount = answer['amount']

        removeAmount(accountName, amount)        
      })
    }).catch((err) => console.log(err))

}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName)

  if(!amount) {
    console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'),
    )
    return withdraw()
  }

  if(accountData.balance < amount) {
    console.log(chalk.bgRed.black('Valor indisponível!'))
    return withdraw()
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err)
    },
  )

  console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`),
  )
  operation()
}

//Transferência
function transfer(){
  inquirer.prompt([
    {
      name: 'accountName',
      message: 'Qual a sua conta?',
    },
  ]).then((answer) => {
    const accountName = answer['accountName']

    if(!checkAccount(accountName)){
      return transfer()
    }

    inquirer.prompt([
      {
        name: 'contaDestino',
        message: 'Para qual conta você quer transferir?',
      },
      {
        name: 'valorTransf',
        message: `Quanto você deseja transferir para essa conta?`
      },
    ]).then((answer) => {
      const contaDestino = answer['contaDestino']
      const valorTransf = answer['valorTransf']

      if(!checkAccount(contaDestino)){
        return transfer()
      } else {
        transfAmmount(accountName,contaDestino,valorTransf)
      }
      operation()      
    })
  })
}

function transfAmmount(accountName,contaDestino,valorTransf){
  
  const accountData1 = getAccount(accountName)
  const accountData2 = getAccount(contaDestino)

  if(!valorTransf){
    console.log(
      chalk.bgRed.black('Ocorreu um errom tente novamente mais tarde!')
    )
    return transfer()
  }

  if(accountName < valorTransf) {
    console.log(chalk.bgRed.black('Valor indisponível!'))
    return transfer()
  }

  accountData1.balance = parseFloat(accountData1.balance) - parseFloat(valorTransf)
  accountData2.balance = parseFloat(accountData2.balance) + parseFloat(valorTransf)

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData1),
    function (err){
      console.log(err)
    },
  )
  fs.writeFileSync(
    `accounts/${contaDestino}.json`,
    JSON.stringify(accountData2),
    function (err){
      console.log(err)
    },
  )

  console.log(chalk.greenBright(`Foi transferido R$${valorTransf} de ${accountName} para ${contaDestino}. `))

}











//Empréstimo
function loan(){
  console.log("emprestimoo")
}

//Cheque Especial
function overdraft() {
  console.log("cheque especialll")
}

//desafio: fazer transferencia de conta, juros, emprestimo, cheque especial, aviso de cheque especial, etc.
