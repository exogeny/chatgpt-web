import EmojiPicker, {
  Emoji as EmojiItem,
  EmojiStyle,
  Theme as EmojiTheme,
} from "emoji-picker-react";

export function Picker(props: {
  onEmojiClick: (emojiId: string) => void;
}) {
  return (
    <EmojiPicker
      lazyLoadEmojis
      theme={EmojiTheme.AUTO}
      getEmojiUrl={getEmojiUrl}
      onEmojiClick={(e) => {
        props.onEmojiClick(e.unified);
      }}
    />
  );
}

export function getEmojiUrl(unified: string, style: EmojiStyle) {
  return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/${style}/64/${unified}.png`;
}

export default function Emoji(props: { avatar: string; size?: number }) {
  return (
    <EmojiItem
      unified={props.avatar}
      size={props.size ?? 18}
      getEmojiUrl={getEmojiUrl}
    />
  )
}
