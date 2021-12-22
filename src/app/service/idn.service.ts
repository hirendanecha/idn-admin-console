import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpUrlEncodingCodec} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { Source } from '../model/source';
import { AuthenticationService } from '../service/authentication-service.service';

@Injectable({
  providedIn: 'root'
})

export class IDNService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  codec = new HttpUrlEncodingCodec;

  constructor(
        private http: HttpClient,
        private messageService: MessageService,
        private authenticationService: AuthenticationService) { 
  }

  searchDuplicatedAccounts(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/search-aggregations/identities?limit=0`;

    let payload = {
      "query": {
          "query": "*"
      },
      "aggregationsDsl": {
          "accounts": {
              "nested": {
                  "path": "accounts"
              },
              "aggs": {
                  "source_id": {
                      "terms": {
                          "field": "accounts.source.id",
                          "min_doc_count": 2,
                          "size": 100
                      },
                      "aggs": {
                          "identities": {
                              "terms": {
                                  "field": "_uid",
                                  "min_doc_count": 2
                              },
                              "aggs": {
                                  "accounts": {
                                      "top_hits": {}
                                  }
                              }
                          }
                      }
                  }
              }
          }
      }
    };

    return this.http.post(url, payload, this.httpOptions).pipe(
      catchError(this.handleError(`searchDuplicatedAccounts`))
    );
  }

  searchIdentities(identityId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/search/identities`;

    let payload = {
      "query": {
          "query": `id:${identityId}`
      }
    };

    return this.http.post(url, payload, this.httpOptions).pipe(
      catchError(this.handleError(`searchIdentities`))
    );
  }

  searchAggregationSources(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/sources`;

    return this.http.get(url, this.httpOptions).pipe(
      catchError(this.handleError(`getAggregationSources`))
    );
  }

  getAggregationSchedules(cloudExternalID: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/cc/api/source/getAggregationSchedules/${cloudExternalID}`;

    return this.http.get(url).pipe(
      catchError(this.handleError(`getAggregationSchedules`))
    );
  }

  getEntitlementAggregationSchedules(cloudExternalID: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/cc/api/source/getEntitlementAggregationSchedules/${cloudExternalID}`;

    return this.http.get(url).pipe(
      catchError(this.handleError(`getEntitlementAggregationSchedules`))
    );
  }

  updateAggregationSchedules(source: Source, enable: boolean): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let encodedCronExp = this.codec.encodeValue(source.accountAggCronExp);
    encodedCronExp = encodedCronExp.replace('?', '%3F');
    let url = `https://${currentUser.tenant}.api.identitynow.com/cc/api/source/scheduleAggregation/${source.cloudExternalID}?enable=${enable}&cronExp=${encodedCronExp}`;
    
    let myHttpOptions = {
      headers: new HttpHeaders({
      })
    };
    return this.http.post(url, null, myHttpOptions);
  }

  updateEntAggregationSchedules(source: Source, enable: boolean): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let encodedCronExp = this.codec.encodeValue(source.entAggCronExp);
    encodedCronExp = encodedCronExp.replace('?', '%3F');
    let url = `https://${currentUser.tenant}.api.identitynow.com/cc/api/source/scheduleEntitlementAggregation/${source.cloudExternalID}?enable=${enable}&cronExp=${encodedCronExp}`;
    
    let myHttpOptions = {
      headers: new HttpHeaders({
      })
    };
    return this.http.post(url, null, myHttpOptions);
  }

   /** Log a HeroService message with the MessageService */
   private log(message: string) {
     this.messageService.add(`${message}`);
   }

   private logError(error: string) {
      this.messageService.addError(`${error}`);
   }

   /**
    * Handle Http operation that failed.
    * Let the app continue.
    * @param operation - name of the operation that failed
    * @param result - optional value to return as the observable result
    */
   private handleError<T> (operation = 'operation', result?: T, logErr:boolean = true) {
     return (error: any): Observable<T> => {

       // TODO: send the error to remote logging infrastructure
       console.error(error); // log to console instead

       // TODO: better job of transforming error for user consumption
       if (logErr) {
          this.logError(`${operation} failed: ${error.message}`);
       }
       // Let the app keep running by returning an empty result.
       return of(result as T);
     };
   }

   private handleException<T> (operation = 'operation', errorMessage?: string , propagateAPIError?:boolean) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead
      if (propagateAPIError) {
        throw new Error(error);
      }
      else if (error.toUpperCase() == "OK") {
        return of(error as T);
      }
      else if (errorMessage) {
        throw new Error(errorMessage);
      } 
      else {
        throw new Error('System error. Please contact system admistrator');
      }

      // return of(error as T);
    };
  }

}