import { Component, OnInit, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit {

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
    this.tiles = [];
    for (let i: number = 0; i < this.totalTiles; i++) {
      this.tiles.push(i);
    }
    this.shuffleArray(this.tiles);
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

  onStartGame() {
    // set moves to default 0
    this.moves = 0;

    // set complete flag to false
    this.isCompletedFlag = false;
  }
}
