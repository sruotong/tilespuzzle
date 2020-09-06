import { TestBed, ComponentFixture, async, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { BrowserModule, By } from '@angular/platform-browser';
import { DragulaModule, DragulaService } from 'ng2-dragula';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let comp: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let dragulaService: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        DragulaModule.forRoot()
      ],
      declarations: [AppComponent],
      providers: [DragulaService]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(AppComponent);
      comp = fixture.componentInstance;
      dragulaService = TestBed.get(DragulaService);
    });
  });


  describe('initial test', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should create the app', () => {
      expect(comp).toBeTruthy();
    });

    it('should render start game button', () => {
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector("[name='startGameButton']")).toBeTruthy();
      expect(
        compiled.querySelector("[name='startGameButton']").textContent
      ).toContain('START GAME');
    });

    it('should render sample image', () => {
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('img').src).toContain(
        'assets/images/isentia.jpg'
      );
    });

    it('should initial default values', () => {
      fixture.detectChanges();
      expect(comp.totalTiles).toBe(9);
      expect(comp.moves).toBe(0);
    });

    describe('test setup tiles array', () => {
      it('should call setup tiles function, when initial component', () => {
        spyOn(comp, 'setupTiles').and.callThrough();
        fixture.detectChanges();
        expect(comp.setupTiles).toHaveBeenCalled();
      });

      it('should create a new random array, when there is no history in localstorage', () => {
        spyOn(comp, 'setupTiles').and.callThrough();
        spyOn(comp, 'shuffleArray').and.callThrough();
        fixture.detectChanges();
        expect(comp.shuffleArray).toHaveBeenCalled();
        expect(comp.tiles).not.toBe([]);
        expect(comp.tiles).not.toBe([0, 1, 2, 3, 4, 5, 6, 7, 8]);
      });
    });

    describe('test image load and canvas', () => {
      beforeEach(() => {
        comp.tiles = [5, 8, 1, 3, 0, 2, 4, 6, 7];
        spyOn(comp, 'onSourceImageLoaded').and.callThrough();
      });

      it('should load original image', (done) => {
        fixture.detectChanges();
        setTimeout(() => {
          expect(comp.originImg.nativeElement.naturalWidth).not.toEqual(0);
          done();
        }, 200);
      });

      it('should call image loaded function, when original image loaded', (done) => {
        fixture.detectChanges();
        setTimeout(() => {
          expect(comp.onSourceImageLoaded).toHaveBeenCalled();
          expect(comp.tileWidth).toBe(Math.round(comp.originImg.nativeElement.naturalWidth / 3));
          done();
        }, 200);
      });

      it('should load 9 canvas for tiles', (done) => {
        fixture.detectChanges();
        setTimeout(() => {
          expect(comp.tilesCanvas).toBeTruthy();
          const temp = comp.tilesCanvas.toArray();
          temp.forEach(t => {
            expect(t.nativeElement.width).toBe(comp.tileWidth);
            expect(t.nativeElement.height).toBe(comp.tileWidth);
          });
          done();
        }, 200);
      });
    });

    describe('test start function', () => {
      beforeEach(() => {
        spyOn(comp, 'onStartGame').and.callThrough();
        fixture.detectChanges();
        let button = fixture.debugElement.nativeElement.querySelector('button');
        button.click();
      });

      it('should call start game function, after start button clicked', fakeAsync(() => {
        tick();
        expect(comp.onStartGame).toHaveBeenCalled();
      }));

      it('should update moves to 0, after start button clicked', fakeAsync(() => {
        tick();
        expect(comp.moves).toBe(0);
      }));

      it('should update complete flag to false, after start button clicked', fakeAsync(() => {
        tick();
        expect(comp.isCompletedFlag).toBe(false);
      }));
    });

    describe('test drag and drop', () => {
      it('should increase moves after drop', () => {
        spyOn(dragulaService, 'drop').and.returnValue(of({}));
        fixture.detectChanges();
        comp.subscribeDrop();
        expect(comp.moves).toBe(1);
      });

      it('should udpate html as \'TOTAL MOVES: 1\', when moves increased from 0 to 1 ', () => {
        spyOn(dragulaService, 'drop').and.returnValue(of({}));
        const compiled = fixture.debugElement;
        fixture.detectChanges();
        expect(comp.moves).toBe(0);
        expect(compiled.query(By.css('.total-moves')).nativeElement.textContent).toBe('TOTAL MOVES: 0');
        comp.subscribeDrop();
        expect(comp.moves).toBe(1);
        fixture.detectChanges();
        expect(compiled.query(By.css('.total-moves')).nativeElement.textContent).toBe('TOTAL MOVES: 1');
      });

      it('should call is completed function', () => {
        spyOn(dragulaService, 'drop').and.returnValue(of({}));
        spyOn(comp, 'isCompleted').and.callThrough();
        fixture.detectChanges();
        comp.subscribeDrop();
        expect(comp.isCompleted).toHaveBeenCalled();
      })

      describe('test is completed function', () => {
        it('should return false, if not completed', () => {
          comp.tiles = [0, 1, 2, 3, 6, 5, 4, 8, 7];
          spyOn(comp, 'isCompleted').and.callThrough();
          expect(comp.isCompleted()).toBe(false);
        });

        it('should return true, if completed', () => {
          comp.tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
          spyOn(comp, 'isCompleted').and.callThrough();
          expect(comp.isCompleted()).toBe(true);
        });
      });

      it('should update iscompletedflag value', () => {
        spyOn(dragulaService, 'drop').and.returnValue(of({}));
        spyOn(comp, 'isCompleted').and.callThrough();
        fixture.detectChanges();
        comp.tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        comp.subscribeDrop();
        expect(comp.isCompletedFlag).toBe(true);
      });
    });

  });
});
