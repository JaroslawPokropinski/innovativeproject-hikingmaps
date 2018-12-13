import { Component, OnInit } from '@angular/core';
import { AnnouncementService} from '../announcement.service';
import { Announcement } from '../announcement';
import {MenuItem, MessageService} from 'primeng/api';
import { Router } from '@angular/router';
import {SelectItem} from 'primeng/api';
import * as Leaflet from 'leaflet';


@Component({
  selector: 'app-browse-announcement',
  templateUrl: './browse-announcement.component.html',
  styleUrls: ['./browse-announcement.component.css']
})
export class BrowseAnnouncementComponent implements OnInit {

  announcements: Announcement[];

  items: MenuItem[];

  selectedAnnouncement: Announcement;

  displayDialogDetails: boolean;

  displayDialogOptions: boolean;

  displayDialogInterest: boolean;

  sortOptions: SelectItem[];

  sortKey: string;

  sortField: string;

  sortOrder: number;

  displayTypes: SelectItem[];

  selectedType: string;

  selectedToConfirmAcceptationStates: {first: string, second: boolean}[];

  selectedAcceptationStates: {first: string, second: boolean}[] = [{first: 'asdasd', second: true}];

  selectedAcceptationState: {id: string, states: [{first: string, second: boolean}]};

  acceptationStates: {id: string, states: [{first: string, second: boolean}]}[] = [];

  modifiedAnnouncement: Announcement;

  showInterested: boolean;

  showOptions: boolean;

  showConfirm: boolean;

  showStatus: boolean;

  constructor(
    private announcementService: AnnouncementService,
    private messageService: MessageService,
    private router: Router
  ) { }


  ngOnInit() {
    this.getAllAnnouncements();


    this.displayTypes = [

      {label: 'All', icon: 'pi pi-fw pi-question', value: { command: (onclick) => {this.getAllAnnouncements(); }}},
      {label: 'Interesting', icon: 'pi pi-fw pi-question', value: { command: (onclick) => {this.getInterestingAnnouncements(); }}},
      {label: 'My', icon: 'pi pi-fw pi-question', value: { command: (onclick) => {this.getMyAnnouncements(); }}},
    ];

    this.items = [
      {
        label: 'User',
        icon: 'pi pi-fw pi-user',
        items: [
          {label: 'Login', icon: 'pi pi-fw pi-question', command: (onclick) => {this.router.navigate(['/login']); } },
          {label: 'Register', icon: 'pi pi-fw pi-question', command: (onclick) => {this.router.navigate(['/register']); } }
        ]
      },
      {
        label: 'Announcement',
        icon: 'pi pi-fw pi-pencil',
        items: [
          {label: 'Add', icon: 'pi pi-fw pi-plus', command: (onclick) => {this.router.navigate(['/add']); } },
        ]
      }
    ];

    this.sortOptions = [
      {label: 'Najnowsze', value: '!date'},
      {label: 'Najstarsze', value: 'date'}
    ];
  }
  getAllAnnouncements() {
    this.announcements = [];
    this.announcementService.getAllAnnouncements()
      .subscribe( data => {
        this.announcements = data;
      });
    this.convertDate();
    this.showInterested = true;
    this.showConfirm = false;
    this.showOptions = false;
    this.showStatus = false;
  }

  getMyAnnouncements() {

    this.announcements = [];
    this.announcementService.getMyAnnouncements()
      .subscribe( data => {
        for (let i = 0; i < data.length; i++) {
            this.announcements.push(data[i].first);
            this.acceptationStates.push({id: data[i].first.id, states: data[i].second});
        }
      });
    this.convertDate();
    this.showInterested = false;
    this.showConfirm = true;
    this.showOptions = true;
    this.showStatus = false;
  }

  getInterestingAnnouncements() {
    this.announcements = [];
    this.announcementService.getInterestingAnnouncements()
      .subscribe(data => {
        for (let i = 0; i < data.length; i++) {
          this.announcements.push(data[i].first);
          this.announcements[this.announcements.length - 1].status = data[i].second;
          console.log(this.announcements[this.announcements.length - 1]);
        }
      });
    this.convertDate();
    this.showInterested = false;
    this.showConfirm = false;
    this.showOptions = false;
    this.showStatus = true;
  }
  convertDate() {
    const re = /(\d+)\-(\d+)\-(\d+)T(\d+):(\d+):(\d+)/;
    for (let i = 0; i < this.announcements.length; i++) {
      if (this.announcements[i].date != null) {
        const m = this.announcements[i].date.match(re);
        if (m) {
          const h = (parseInt(m[4], 10) + 1) % 24; // add 1 cause poland is in such timezone
          this.announcements[i].date = `${m[1]}/${m[2]}/${m[3]} ${h}:${m[5]}`;
        }
      }
    }
  }

  selectAnnouncementForDetails(event: Event, announcement: Announcement) {
    this.selectedAnnouncement = announcement;
    this.displayDialogDetails = true;
    event.preventDefault();

  }

  selectAnnouncementForOptions(event: Event, announcement: Announcement) {
    this.selectedAnnouncement = announcement;
    this.modifiedAnnouncement = this.selectedAnnouncement;
    this.displayDialogOptions = true;
    event.preventDefault();
  }
  selectAnnouncementForOptions2() {
    this.modifiedAnnouncement = this.selectedAnnouncement;
  }

  selectAnnouncementForInterested(event: Event, announcement: Announcement) {
    console.log(this.acceptationStates.length);
    for (let i = 0; i < this.acceptationStates.length; i++) {
      if (announcement.id === this.acceptationStates[i].id) {
        this.selectedAcceptationState = this.acceptationStates[i];
        this.selectedAcceptationStates = [];
        console.log('length' + this.acceptationStates[i].states.length);
        for (let j = 0; j < this.acceptationStates[i].states.length; j++) {
          if (!this.acceptationStates[i].states[j].second) {
            console.log('second' + this.acceptationStates[i].states[j].second);
            this.selectedAcceptationStates.push(this.acceptationStates[i].states[j]);
          }
        }
      }
    }
    this.displayDialogInterest = true;
    event.preventDefault();
  }

  onSortChange(event) {
    const value = event.value;

    if (value.indexOf('!') === 0) {
      this.sortOrder = -1;
      this.sortField = value.substring(1, value.length);
    } else {
      this.sortOrder = 1;
      this.sortField = value;
    }
  }

  onDialogHide() {
    this.selectedAnnouncement = null;
  }

  selectAsInterested(announcemnt: Announcement) {
    this.announcementService.addInterest(announcemnt.id)
      .subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Iterested succesfully' });
      this.router.navigate(['/browse']);
      // send message about succes and reroute
    }, (error) => {
      // send message about error
      this.messageService.add({ severity: 'error', summary: 'Error',
        detail: (error.error.message) ? error.error.message : error.statusText });
    });
  }

  handleChanges() {
    console.log(this.modifiedAnnouncement);
    this.announcementService.changeMyAnnouncement(this.modifiedAnnouncement.id, this.modifiedAnnouncement.title, this.modifiedAnnouncement.start, this.modifiedAnnouncement.destination, this.modifiedAnnouncement.description, this.modifiedAnnouncement.date)
      .subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Announcement changed succesfully' });
      }, (error) => {
        // send message about error
        this.messageService.add({ severity: 'error', summary: 'Error',
          detail: (error.error.message) ? error.error.message : error.statusText });
      });
  }

  handleDelete() {
    this.announcementService.deleteMyAnnouncement( this.selectedAnnouncement.id)
      .subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Announcement deleted succesfully' });
      }, (error) => {
        // send message about error
        this.messageService.add({ severity: 'error', summary: 'Error',
          detail: (error.error.message) ? error.error.message : error.statusText });
      });

  }

  handleConfirmInterest() {

    for (let i = 0; i < this.selectedToConfirmAcceptationStates.length; i++) {
      this.announcementService.confirmUser(this.selectedToConfirmAcceptationStates[i].first, this.selectedAcceptationState.id)
        .subscribe(() => {
          this.messageService.add({severity: 'success', summary: 'Succes', detail: 'User accepted succesfully'});
        }, (error) => {
          // send message about error
          this.messageService.add({
            severity: 'error', summary: 'Error',
            detail: (error.error.message) ? error.error.message : error.statusText
          });
        });
    }
    this.getMyAnnouncements();
  }

  displayMaps() {
    const map = Leaflet.map('mapid').setView([49.6563, 18.8902], 14);
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  }
}


