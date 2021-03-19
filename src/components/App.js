import { Tabs, Tab } from 'react-bootstrap'
import SolidaBank from '../abis/SolidaBank.json'
import React, { Component } from 'react';
import Token from '../abis/Token.json'
import solidabank from '../solidabank.png';
import Web3 from 'web3';
import './App.css';

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    if(typeof window.ethereum!=='undefined'){
      
    const web3 = new Web3(window.ethereum)
    const netId = await web3.eth.net.getId()
    const accounts = await web3.eth.getAccounts()
    
    if(typeof accounts[0] !=='undefined'){
      const balance = await web3.eth.getBalance(accounts[0])
      this.setState({ account: accounts[0], balance: balance, web3: web3 })
      } else {
      window.alert('Please login with MetaMask')
      }

    try {
      const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address)
      const solidabank = new web3.eth.Contract(SolidaBank.abi, SolidaBank.networks[netId].address)
      const solidaBankAddress = SolidaBank.networks[netId].address
      const tokenBalance = await token.methods.balanceOf(this.state.account).call()
      const tokenBalanceSmall = web3.utils.fromWei(tokenBalance)
      this.setState({token: token, solidabank: solidabank, solidaBankAddress: solidaBankAddress, tokenBalanceSmall: tokenBalanceSmall})
    } catch (e) {
      console.log('Error', e)
      window.alert('Contracts not deployed to the current network')
    }
    } else {
      window.alert('Please install MetaMask')
    }

    //check if MetaMask exists

      //assign to values to variables: web3, netId, accounts

      //check if account is detected, then load balance&setStates, elsepush alert

      //in try block load contracts

    //if MetaMask not exists push alert
  }

  async deposit(amount) {
    if(this.state.solidabank!=='undefined'){
      try{
        await this.state.solidabank.methods.deposit().send({value: amount.toString(), from: this.state.account})
      } catch (e) {
        console.log('Error, deposit: ', e)
      }
    }    
  }

  async withdraw(e) {
    e.preventDefault()
    if(this.state.solidabank!=='undefined'){
      try{
        await this.state.solidabank.methods.withdraw().send({from: this.state.account})
      } catch(e) {
        console.log('Error, withdraw: ', e)
      }
    }
  }

  async borrow(amount) {
    if(this.state.solidabank!=='undefined'){
      try{
        await this.state.solidabank.methods.borrow().send({value: amount.toString(), from: this.state.account})
      } catch (e) {
        console.log('Error, borrow: ', e)
      }
    }
  }

  async payOff(e) {
    e.preventDefault()
    if(this.state.solidabank!=='undefined'){
      try{
        const collateralEther = await this.state.solidabank.methods.collateralEther(this.state.account).call({from: this.state.account})
        const tokenBorrowed = collateralEther/2
        await this.state.token.methods.approve(this.state.solidaBankAddress, tokenBorrowed.toString()).send({from: this.state.account})
        await this.state.solidabank.methods.payOff().send({from: this.state.account})
      } catch(e) {
        console.log('Error, pay off: ', e)
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      solidabank: null,
      balance: 0,
      SolidaBankAddress: null
    }
  }

  render() {
    return (
      <div className='text-monospace'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.solida.io"
            target="_blank"
            rel="noopener noreferrer"
          >

        <img src={solidabank} className="App-logo" alt="logo" height="32"/>
          <b>SolidaBank</b>
        </a>

        

        </nav>
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1>Decentralized Savings & Loans</h1>
          <h2>{this.state.account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="deposit" id="deposit">
                <Tab eventKey="deposit" title="Deposit">
                  <div>
                  <br></br>Please Enter Deposit Amount
                  <br></br>(Min. deposit is 0.01 ETH)
                  <br></br>(Only one active deposit at a time)
                  <br></br><form onSubmit={(e) => {
                    e.preventDefault()
                    let amount = this.depositAmount.value
                    amount = amount * 10**18
                    this.deposit(amount)
                  }}>
                    <div className='form-group mr-sm-2'>
                      <br></br>
                      <input
                        id='depositAmount'
                        step="0.01"
                        type='number'
                        min="0.01"
                        className="form-control form-control-md"
                        placeHolder="amount..."
                        required
                        ref={(input) => { this.depositAmount = input }}
                      />
                    </div>
                    <button type='submit' className='btn btn-primary'>DEPOSIT</button>
                  </form>
                  </div>
                  </Tab>


                  <Tab eventKey="withdraw" title="Withdraw">
                  <br></br>
                    Do you want to withdraw + take interest?
                    <br></br>
                    <br></br>
                  <div>
                    <button type='submit' className='btn btn-primary' onClick={(e) => this.withdraw(e)}>WITHDRAW</button>
                  </div>
                </Tab>
                <Tab eventKey="borrow" title="Borrow">
                  <div>

                  <br></br>
                    Do you want to borrow tokens?
                    <br></br>
                    (You'll get 50% of collateral, in Tokens)
                    <br></br>
                    Type collateral amount (in ETH)
                    <br></br>
                    <br></br>
                    <form onSubmit={(e) => {

                      e.preventDefault()
                      let amount = this.borrowAmount.value
                      amount = amount * 10 **18 //convert to wei
                      this.borrow(amount)
                    }}>
                      <div className='form-group mr-sm-2'>
                        <input
                          id='borrowAmount'
                          step="0.01"
                          type='number'
                          ref={(input) => { this.borrowAmount = input }}
                          className="form-control form-control-md"
                          placeholder='amount...'
                          required />
                      </div>
                      <button type='submit' className='btn btn-primary'>BORROW</button>
                    </form>
                  </div>
                </Tab>
                <Tab eventKey="payOff" title="Payoff">
                  <div>

                  <br></br>
                    Do you want to payoff the loan?
                    <br></br>
                    (You'll receive your collateral - fee)
                    <br></br>
                    <br></br>
                    <button type='submit' className='btn btn-primary' onClick={(e) => this.payOff(e)}>PAYOFF</button>
                  </div>
                </Tab>
                <Tab eventKey="earnings" title="Earnings">
                  <div>

                  <br></br>
                    All Time Earnings                    
                    <br></br>
                    <br></br>
                    <h2>{this.state.tokenBalanceSmall} SSTK</h2>
                  </div>
                </Tab>
              </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;