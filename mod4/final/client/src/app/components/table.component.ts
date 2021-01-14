import { Component, OnInit } from '@angular/core';
import { StocksService } from '../stocks.service';
import { SpacName } from '../Models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  stockList=[]
  allstocks=[]
  allstocks1=[]
  cachedstock=[]
  datasource=[];
  searchValue:string;
  isAdmin:boolean;
  isLoggedin: boolean;
  userid = 5678;
  filteredData=[]

  constructor(private stockSvc:StocksService, private router: Router) { }

  async ngOnInit() {

    this.isAdmin = true;
    this.isLoggedin = true;

    if (this.isAdmin && this.isLoggedin){
      this.stockList = await this.stockSvc.getStockList();
      console.info('>> contents: ', this.stockList)
      this.allstocks = await this.stockSvc.getAllStocks();
    }  
  }



  async deleteSpac(id,ticker){
    await this.stockSvc.deleteSpac(id,ticker);
    alert(`${ticker} has been deleted from main stock table.`); 
    this.stockList = await this.stockSvc.getStockList();

  }

  async insertSpac(ticker,name){
    console.log(ticker)
    console.log(name)
    await this.stockSvc.insertSpac({ticker,name} as SpacName);
    alert(`${ticker} has been added to main stock table.`); 
    this.stockList = await this.stockSvc.getStockList();
  }
  
}
