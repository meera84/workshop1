import { Pipe, PipeTransform } from '@angular/core';
import { SpacName } from './Models';

@Pipe({
  name: 'searchfilter'
})
export class SearchfilterPipe implements PipeTransform {

  transform(Stocks: SpacName[], searchValue:string): SpacName[] {
    if (!Stocks || !searchValue) {
      return Stocks;
    }
    return Stocks.filter(stock => 
      stock.name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()) ||
      stock.name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()) )
  }

}
