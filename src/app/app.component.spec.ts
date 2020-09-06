import { TestBed, ComponentFixture, async, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let comp: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(AppComponent);
      comp = fixture.componentInstance;
    });
  });


  describe('initial test', () => {
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

  });
});
