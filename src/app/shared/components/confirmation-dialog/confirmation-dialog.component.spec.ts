import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { By } from '@angular/platform-browser';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.title).toBe('Confirm Action');
    expect(component.message).toBe('Are you sure you want to proceed?');
    expect(component.confirmText).toBe('Confirm');
    expect(component.cancelText).toBe('Cancel');
    expect(component.confirmButtonClass).toBe('confirm');
    expect(component.cancelButtonClass).toBe('cancel');
  });

  it('should display custom input values', () => {
    component.title = 'Delete Hero';
    component.message = 'Are you sure you want to delete this hero?';
    component.confirmText = 'Delete';
    component.cancelText = 'Keep';
    component.confirmButtonClass = 'danger';
    component.cancelButtonClass = 'secondary';

    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('h3'));
    const messageElement = fixture.debugElement.query(By.css('p'));

    expect(titleElement.nativeElement.textContent).toBe('Delete Hero');
    expect(messageElement.nativeElement.innerHTML).toBe('Are you sure you want to delete this hero?');
  });

  it('should emit confirmed event when confirm button is clicked', () => {
    spyOn(component.confirmed, 'emit');
    spyOn(component, 'closeDialog');

    component.onConfirm();

    expect(component.confirmed.emit).toHaveBeenCalled();
    expect(component.closeDialog).toHaveBeenCalled();
  });

  it('should emit cancelled event when cancel button is clicked', () => {
    spyOn(component.cancelled, 'emit');
    spyOn(component, 'closeDialog');

    component.onCancel();

    expect(component.cancelled.emit).toHaveBeenCalled();
    expect(component.closeDialog).toHaveBeenCalled();
  });

  it('should open dialog when openDialog is called', () => {
    const mockDialog = {
      nativeElement: {
        showModal: jasmine.createSpy('showModal')
      }
    };
    component.dialog = mockDialog as any;

    component.openDialog();

    expect(mockDialog.nativeElement.showModal).toHaveBeenCalled();
  });

  it('should close dialog when closeDialog is called', () => {
    const mockDialog = {
      nativeElement: {
        close: jasmine.createSpy('close')
      }
    };
    component.dialog = mockDialog as any;

    component.closeDialog();

    expect(mockDialog.nativeElement.close).toHaveBeenCalled();
  });

  it('should render dialog element', () => {
    const dialogElement = fixture.debugElement.query(By.css('dialog'));
    expect(dialogElement).toBeTruthy();
  });

  it('should render dialog content structure', () => {
    const dialogContent = fixture.debugElement.query(By.css('.dialog-content'));
    const titleElement = fixture.debugElement.query(By.css('h3'));
    const messageElement = fixture.debugElement.query(By.css('p'));
    const actionsElement = fixture.debugElement.query(By.css('.dialog-actions'));

    expect(dialogContent).toBeTruthy();
    expect(titleElement).toBeTruthy();
    expect(messageElement).toBeTruthy();
    expect(actionsElement).toBeTruthy();
  });

  it('should render action buttons', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons.length).toBe(2);
  });
}); 