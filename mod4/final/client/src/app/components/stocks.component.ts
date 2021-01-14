import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AddSpac } from '../Models';
import { StocksService } from '../stocks.service';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit {
  
  tickersList = [];
  userSignedIn:boolean;
  inWatchList:boolean;
  stockList=[];
  stockCount = 0
  userID = "";
  addSpacs:AddSpac;
  us1:boolean;

  constructor(private stockSvc:StocksService, private router: Router) { }

  async ngOnInit(){
    this.stockList = await this.stockSvc.sendStocklist()
    this.stockCount = await this.stockList.length;
    this.userSignedIn = await this.stockSvc.isLogin();
    this.userID = await this.stockSvc.userid;
    
  }
  viewSpac(symbol){
    console.log(symbol);
    this.router.navigate(['/details',symbol])
  }
  
  addSpac(symbol, price){
    console.log(symbol, price)
    const date = Date.now()
    console.log('date,' ,date)
    const data:AddSpac = {
      userid : this.userID,
      ticker:symbol,
      loggeddate: date,
      price:price
    }
    this.stockSvc.addToWatchList(data)
    alert(`${symbol} has been added to watchlist.`); 

  }

  async authenticate(){
    await this.stockSvc.authenticate();
    this.userSignedIn = await this.stockSvc.isLogin()
    this.userID = await this.stockSvc.userid;
    console.log(this.userSignedIn )
  
      this.router.navigate(['/watchlist'])
    
    
    }
  }

