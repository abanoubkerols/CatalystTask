import axios from 'axios';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
})
export class TaskComponent implements OnDestroy, AfterViewInit {
  @Input() id: string;
  @Input() notes: string;
  @Input() index: number;
  @Input() isLast: boolean;
  @Output() removeTodo: EventEmitter<any>;
  @Output() changePage: EventEmitter<any>;

  public options: boolean;
  public deleting: boolean;
  private observer?: IntersectionObserver;
  constructor(private element: ElementRef) {
    this.id = '';
    this.index = 0;
    this.notes = '';
    this.isLast = false;

    this.options = false;
    this.deleting = false;
    this.removeTodo = new EventEmitter();
    this.changePage = new EventEmitter();
  }

  mouseEnter = () => {
    this.options = true;
  };

  mouseLeave = () => {
    this.options = false;
  };

  deleteTodo = () => {
    this.deleting = true;
//DELETE API. The call to delete the to-do item from the data store occurs here.
    axios
      .delete(`/server/to_do_list_function/${this.id}`)   //Ensure that 'to_do_list_function' is the package name of your function.
      .then((response) => {
        const {
          data: {
            todoItem: { id },
          },
        } = response.data;
        this.removeTodo.emit(id);
      })
      .catch((err) => {
        console.log(err.response.data);
      })
      .finally(() => {
        this.deleting = false;
      });
  };

  ngAfterViewInit() {
    if (this.isLast && this.element) {
      this.observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.changePage.emit();
        }
      });
      this.observer.observe(this.element.nativeElement);
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
