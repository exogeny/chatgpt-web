import styles from "./selector.module.scss";
import { List, ListItem } from "@/app/components/list/list";

export function Selector<T>(props: {
  id?: string;
  items: Array<{
    title: string;
    subTitle?: string;
    value: T;
  }>;
  defaultSelectedValue?: T;
  onSelection?: (selection: T[]) => void;
  onClose?: () => void;
  multiple?: boolean;
}) {
  return (
    <div className={styles["selector"]} id={props.id} onClick={() => props.onClose?.()}>
      <div className={styles["selector-content"]}>
        <List>
          {props.items.map((item, i) => {
            const selected = props.defaultSelectedValue === item.value;
            return (
              <ListItem
                className={`styles["selector-item"] ${selected && styles["selected"]}`}
                key={i}
                title={item.title}
                subTitle={item.subTitle}
                onClick={() => {
                  props.onSelection?.([item.value]);
                  props.onClose?.();
                }}
              />
            );
          })}
        </List>
      </div>
    </div>
  );
}
