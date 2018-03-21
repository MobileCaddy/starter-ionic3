# MobileCaddy Starter for Ionic


## Prerequisites

* Node v8.5.0+


## Getting Started

There are 2 ways to get started - the best is to use the MobileCaddy CLI, and the other is more manual.

### 1) Use the MobileCaddy CLI (preferred)

First install the v2 MobileCaddy CLI
```
npm i -g https://github.com/MobileCaddy/mobilecaddy-cli.git#unstable-v2
```

You can then start a new MobileCaddy project (from this repo) with this command. The last arg is the name of your new project

```
mobilecaddy new https://github.com/toddhalfpenny/mobilecaddy-ionic3-poc/archive/master.zip myNewApp
```

### 2) Manual Approach

* Clone, or download and unzip, this repo, and `cd` into the dir

* Install dependencies
```
npm install
```

* Run MobileCaddy setup script
```
npm run mobilecaddy setup
```

## Running the app in CodeFlow

### With the new CLI

```
mobilecaddy serve
```

### With the old CLI

* We need to start a CORS server (if wanting to communiacate with SFDC, i.e. when not using mock data).
```
npm run mobilecaddy cors
```

* Start your app in a new shell with this
```
ionic serve --p 3030
```

You can also use the `?local` in the query string to use mock data (if you have any), but there is no way to record just yet.

## Recording mock data

Ours app can read data from local .json files, instead of talking to the actual Salesforce.com platform. To populate these .json files we can record responses from SFDC with the use of the `record` argument when running our CORS server, like this;

### With the new CLI

```
mobilecaddy serve --rec
```

### With the old CLI
```
npm run mobilecaddy cors record
```


## Using the MobileCaddy libs in your app

### Example typescript, for a Home Page

Note: Idea is to move the InitialLoadComplete check etc into the new Sync component (that will take over from SyncService), to have just a single call in the "Home" page to Sync, and the component would do either initial sync/cold sync etc.

The example below is mostly to show how you can import and use the `devUtils`

```
import { Component } from '@angular/core';
import { LoadingController, NavController } from 'ionic-angular';
import * as devUtils from 'mobilecaddy-utils/devUtils.js';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  projects;
  accountTable: string = 'Account__ap';

  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController) {

    if ( localStorage.getItem("syncState") == 'InitialLoadComplete' ) {
      this.showAccounts();
    } else {
      let loader = this.loadingCtrl.create({
        content: "Running Sync...",
        duration: 3000
      });
      loader.present();

      devUtils.initialSync([this.accountTable]).then(res => {
        localStorage.setItem('syncState', 'InitialLoadComplete');
        this.showAccounts();
      });
    }
  }

  showAccounts(): void {
    devUtils.readRecords(this.accountTable).then(res => {
      console.log("res", res);
      // loader.dismiss();
      this.projects = res.records;
    });
  }

}
```

## Create resources for pushing to Salesforce

At the moment there isn't an auto-deploy. But you can create the assets you need (a zip for a staic resource, and 2 templates for Visualforce pages) with the new CLI

```
mobilecaddy deploy
```

This will create a zip file in your project's root directory, and 2 visualforce pages in the temporary `mc-tmp` directory.