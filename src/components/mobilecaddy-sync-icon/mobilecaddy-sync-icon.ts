/**
 * MobileCaddy Sync Icon Component
 *
 * @description Manages the sync icon, representing the connection state, sync
 *  state, and outbox state
 *
 * TODO:
 * - Connectivity state
 * - Outbox state
 * - Syncing spin icon
 *
 * Roadmap:
 * -
 */

import { Component, OnInit } from '@angular/core';
import { MobileCaddySyncService } from '../../providers/mobilecaddy-sync.service';

@Component({
  selector: 'mobilecaddy-sync-icon',
  templateUrl: 'mobilecaddy-sync-icon.html'
})
export class MobileCaddySyncIconComponent implements OnInit {
  logTag: string = 'mobilecaddy-sync-icon.ts';
  iconName: string = 'cloud-done';
  spinnerClass: string = '';

  constructor(private mobilecaddySyncService: MobileCaddySyncService) {}

  ngOnInit() {
    this.iconName = 'cloud-done';
    this.mobilecaddySyncService.getSyncState().subscribe(res => {
      console.log(this.logTag, 'SyncState Update1', res);
      switch (res) {
        case 'complete':
          this.iconName = 'cloud-done';
          this.spinnerClass = '';
          break;
        case 'InitialSyncInProgress':
        case 'syncing':
          this.iconName = 'refresh';
          this.spinnerClass = 'spinner';
          break;
      }
    });
  }
}
