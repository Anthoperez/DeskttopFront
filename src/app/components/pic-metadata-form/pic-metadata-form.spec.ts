import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PicMetadataForm } from './pic-metadata-form';

describe('PicMetadataForm', () => {
  let component: PicMetadataForm;
  let fixture: ComponentFixture<PicMetadataForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PicMetadataForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PicMetadataForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
