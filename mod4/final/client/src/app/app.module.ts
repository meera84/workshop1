import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { StocksComponent } from './components/stocks.component';
import { NewsComponent } from './components/news.component';

import { WatchlistComponent } from './components/watchlist.component';
import { TableComponent } from './components/table.component';
import { NavbarComponent } from './components/navbar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SearchfilterPipe } from './searchfilter.pipe';
import { StocksService } from './stocks.service';
import { ContactComponent } from './components/contact.component';
import { DetailsComponent } from './components/details.component';

const routes: Routes = [
  { path: "", component: StocksComponent },
  { path: "watchlist", component: WatchlistComponent },
  { path: "table", component: TableComponent },
  { path: "news", component: NewsComponent },
  { path: "details/:symbol", component: DetailsComponent },
  { path: "contact", component: ContactComponent },
  { path: "", redirectTo: "/", pathMatch: "full" },
  { path: "**", redirectTo: "/", pathMatch: "full" }
];

@NgModule({
  declarations: [
    AppComponent,
    StocksComponent,
    NewsComponent,
    WatchlistComponent,
    TableComponent,
    NavbarComponent,
    SearchfilterPipe,
    ContactComponent,
    DetailsComponent
  ],
  imports: [
    BrowserModule, FormsModule , ReactiveFormsModule, HttpClientModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule

  ],
  providers: [StocksService],
  bootstrap: [AppComponent]
})
export class AppModule { }
