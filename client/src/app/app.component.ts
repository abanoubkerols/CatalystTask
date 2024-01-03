import axios from "axios";
import { Component, OnInit } from "@angular/core";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  notes: string;
  page: number;
  hasMore: boolean;
  todoItems: Array<{ id: string; notes: string }>;
  submitting: boolean;
  fetchState: "init" | "fetched" | "loading";
  constructor() {
    this.notes = "";
    this.hasMore = false;
    this.page = 1;
    this.todoItems = [];
    this.submitting = false;
    this.fetchState = "init";
  }
  //GET API. The existing to-do items from the Datastore is being fetched.
  getTodos = (): void => {
    axios
      .get("/server/to_do_list_function/all", {
        //Ensure that 'to_do_list_function' is the package name of your function.
        params: {
          page: this.page,
          perPage: 200,
        },
      })
      .then((response) => {
        const {
          data: { todoItems, hasMore },
        } = response.data;
        if (this.page === 1) {
          this.todoItems = todoItems as Array<{ id: string; notes: string }>;
        } else {
          this.todoItems = [
            ...new Map(
              this.todoItems.concat(todoItems).map((item) => [item.id, item])
            ).values(),
          ];
        }
        this.hasMore = hasMore;
        this.fetchState = "fetched";
      })
      .catch((err) => {
        console.error(err.response.data);
      });
  };
  //POST API. A new to-do item is being created.
  createTodo = (): void => {
    this.submitting = true;
    axios
      .post(`/server/to_do_list_function/add`, {
        //Ensure that 'to_do_list_function' is the package name of your function.
        notes: this.notes,
      })
      .then((response) => {
        const {
          data: { todoItem },
        } = response.data;
        this.notes = "";
        this.todoItems = [{ ...todoItem }].concat(this.todoItems);
      })
      .catch((err) => {
        console.error(err.response.data);
      })
      .finally(() => {
        this.submitting = false;
      });
  };
  removeTodo = (id: string): void => {
    this.todoItems = this.todoItems.filter((obj) => obj.id !== id);
  };
  changePage = (): void => {
    if (this.hasMore) {
      this.page += 1;
      this.fetchState = "loading";
      this.getTodos();
    }
  };
  ngOnInit() {
    this.fetchState = "init";
    this.getTodos();
  }
}
