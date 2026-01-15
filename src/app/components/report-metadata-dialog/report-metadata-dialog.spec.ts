import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMetadataDialog } from './report-metadata-dialog';

describe('ReportMetadataDialog', () => {
  let component: ReportMetadataDialog;
  let fixture: ComponentFixture<ReportMetadataDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportMetadataDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportMetadataDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
