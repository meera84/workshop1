import { Component, OnInit } from '@angular/core';
import { StocksService } from '../stocks.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isLoggedIn:boolean;
  userid = ""

  constructor(private stockSvc:StocksService) { }

  async ngOnInit(){
   
   this.userid = await this.stockSvc.userid;
   console.log('useridnav',this.userid)

    if (this.userid != null || this.userid!=""){
      this.isLoggedIn= true;
    }
    else
    {
      this.isLoggedIn = false;
    }
    
  }
  signOut(){
    this.stockSvc.logOut();
  }

  authenticate(){
    this.stockSvc.authenticate();
  }

}
