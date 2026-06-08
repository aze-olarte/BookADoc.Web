export interface Action<T> {
  type: string;
  label: string;
  icon: string;
  visible?: (item: T) => boolean;
}
