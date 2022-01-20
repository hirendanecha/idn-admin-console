import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GenerateDocComponent } from './generate-doc.component';

describe('GenerateDocComponent', () => {
  let component: GenerateDocComponent;
  let fixture: ComponentFixture<GenerateDocComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateDocComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
