import { Component, OnInit, ViewChild, ElementRef, QueryList, ViewChildren, OnDestroy } from '@angular/core';
import { DragulaService } from 'ng2-dragula';
import { Subscription, Observable, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit, OnDestroy {

  // element reference of  original image
  @ViewChild('originImg') originImg: ElementRef;

  // element reerence of tiles' canvas
  @ViewChildren('tilesCanvas') tilesCanvas: QueryList<ElementRef>;

  // a number of total tiles
  totalTiles: number;

  // a number type of a tile's width
  tileWidth: number;

  // a number to record totla moves
  moves: number;

  // a flag for determine is game complete
  isCompletedFlag: boolean;

  // a number array to save orders of the tiles
  // eg. [5, 8, 1, 3, 0, 2, 4, 6, 7]
  // 5 represent the 5th tile in the 1st postion on the canvas board
  tiles: number[];

  // subscriptions
  dropSubscription: Subscription;
  timerSubscription: Subscription;

  // an oberver for timer from Rxjs
  source: Observable<any>;

  // a seconds timer to record and display on page
  timerSeconds: number;

  constructor(private dragulaService: DragulaService) {
    dragulaService.createGroup("TILES", {
      direction: 'horizontal',
      accepts: () => {
        // if isCompletedFlag is not initialed, 
        // cannot drap and drop tiles(click start button can initial isCompletedFlag)
        // if game is completed, should not able to drag and drop tiles
        return this.isCompletedFlag == false;
      }
    });

    // user rxjs timer to track time
    // first 1000 for initial start time
    // second 1000 for calling next() in 1 second
    this.source = timer(1000, 1000);

    // subscribe the dragula drop function
    this.subscribeDrop();

    // initial timer subscription
    this.timerSubscription = new Subscription();
  }

  subscribeDrop() {
    this.dropSubscription = this.dragulaService.drop().subscribe(() => {
      // update moves after dropped tiles
      this.moves++;
      this.isCompletedFlag = this.isCompleted();

      // update localStorage after dropped tiles
      localStorage.setItem('tileHistory', JSON.stringify({ 'completedFlag': this.isCompletedFlag, 'moves': this.moves, 'tiles': this.tiles }));

      // if the game is completed, should stop timer
      if (this.isCompletedFlag) {
        this.timerSubscription.unsubscribe();
      }
    });
  }

  ngOnInit(): void {
    // initial number of total tiles to 9
    this.totalTiles = 9;

    // initial mmoves to 0
    this.moves = 0;

    // initial tiles
    // set up tiles based on localstorage array
    // or set up tiles with a new shuffled array
    this.setupTiles();
  }

  setupTiles() {
    // if there is not history from localstorage
    // should setup a new random array for tiles
    let tileHistory = JSON.parse(localStorage.getItem('tileHistory'));
    if (tileHistory) {
      this.tiles = tileHistory['tiles'];
      this.moves = tileHistory['moves'];
      this.isCompletedFlag = tileHistory['completedFlag'];
      this.timerSeconds = localStorage.getItem('timer') ? Number(localStorage.getItem('timer')) : 0;
      if (!this.isCompletedFlag) {

        this.timerSubscription = this.source.subscribe(() => {
          this.timerSeconds++;
          localStorage.setItem('timer', this.timerSeconds.toString());
        });
      }
    } else {
      this.tiles = [];
      for (let i: number = 0; i < this.totalTiles; i++) {
        this.tiles.push(i);
      }
      this.shuffleArray(this.tiles);
    }
  }

  // a functon for shuffling array orders randomly
  // @param the array for shuflling
  // if more than one component need this function
  // should add a return type number[] and move this function to a service for sharing.
  shuffleArray(array: number[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // when original image loaded, should draw tiles on canvas
  // each tile's width, height and position are based on original image's width;
  onSourceImageLoaded() {
    // get each tile's width based on original image's natural width
    this.tileWidth = Math.round(this.originImg.nativeElement.naturalWidth / 3);

    // start drawing tiles based on the shuffled array
    let index = 0;
    let canvaTemps = this.tilesCanvas.toArray();
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        let originIndex = this.tiles.indexOf(index);
        canvaTemps[originIndex].nativeElement.width = this.tileWidth;
        canvaTemps[originIndex].nativeElement.height = this.tileWidth;
        canvaTemps[originIndex].nativeElement.getContext('2d').drawImage(this.originImg.nativeElement, col * this.tileWidth, row * this.tileWidth, this.tileWidth, this.tileWidth, 0, 0, this.tileWidth, this.tileWidth);
        index++;
      }
    }
  }

  // a function to determine if game complete or not
  // @return boolean value, True for completed, False for not completed
  isCompleted(): boolean {
    let result = true;
    for (let i = 0; i < this.tiles.length; i++) {
      if (this.tiles[i] != i) {
        result = false;
        break;
      }
    }
    return result;
  }

  onStartGame() {
    // set moves to default 0
    this.moves = 0;

    // set complete flag to false
    this.isCompletedFlag = false;

    // everytime to start or restart the game needs to shuffle array
    // if it is first time to play the game, no need to shuffle array again
    if (localStorage.getItem('tileHistory')) {
      this.shuffleArray(this.tiles);
    }

    // reset the tileHistory, when the game start or restart
    localStorage.setItem('tileHistory', JSON.stringify({ 'completedFlag': this.isCompletedFlag, 'moves': this.moves, 'tiles': this.tiles }));

    // reset timer
    this.timerSeconds = 0;
    localStorage.removeItem('timer');

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.timerSubscription = this.source.subscribe(() => {
      this.timerSeconds++;
      localStorage.setItem('timer', this.timerSeconds.toString());
    });
  }

  ngOnDestroy() {
    this.dropSubscription.unsubscribe();
    this.timerSubscription.unsubscribe();
  }
}
