import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMeta } from './report-meta';

describe('ReportMeta', () => {
  let component: ReportMeta;
  let fixture: ComponentFixture<ReportMeta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportMeta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportMeta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
