export interface SpacName{
  ticker: string,
  name: string
}

export interface Contact{
  name: string,
  email: string,
  subject: string,
  message: string
}


export interface AddSpac{
  userid: any,
  ticker: string,
  loggeddate: any,
  price: string
}

export interface deleteSpac{
  userid: any,
  id:number,
  ticker: string
}