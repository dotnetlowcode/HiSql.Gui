export abstract class BaseViewModel<T extends object> {
  viewData: T;

  constructor(viewData: T) {
    this.viewData = reactive(viewData) as any;
  }
}
