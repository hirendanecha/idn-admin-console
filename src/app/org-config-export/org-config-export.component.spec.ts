import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OrgConfigExportComponent } from './org-config-export.component';

describe('OrgConfigExportComponent', () => {
  let component: OrgConfigExportComponent;
  let fixture: ComponentFixture<OrgConfigExportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgConfigExportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgConfigExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
