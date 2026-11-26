import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridComponent } from './grid.component';

interface MockRow {
  id: number;
  name: string;
}

describe('GridComponent', () => {
  let component: GridComponent<MockRow>;
  let fixture: ComponentFixture<GridComponent<MockRow>>;
  const mockData = [
    { id: 1, name: 'Cardiology' },
    { id: 2, name: 'Neurology' },
  ];
  const mockColumns = [
    {
      columnDef: 'name',
      header: 'Name',
      cell: (element: any) => `${element.name}`,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GridComponent<MockRow>);
    fixture.componentRef.setInput('data', mockData);
    fixture.componentRef.setInput('columns', mockColumns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
