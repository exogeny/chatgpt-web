import { ChatModelType } from "@/lib/model/model";

import BotIcon from "@/public/icons/bot.svg";
import BlackBotIcon from "@/public/icons/black-bot.svg";
import Emoji from "./emoji";

export default function Avatar(props: {
  model?: ChatModelType;
  avatar?: string;
  image?: string;
}) {
  if (props.model) {
    return (
      <div className="no-dark">
        {props.model?.startsWith("gpt-4") ? (
          <BlackBotIcon className="user-avatar" />
        ) : (
          <BotIcon className="user-avatar" />
        )}
      </div>
    );
  }

  if (props.image) {
    return (
      <div className="user-avatar">
        <img src={props.image} />
      </div>
    )
  }

  return (
    <div className="user-avatar">
      {props.avatar && <Emoji avatar={props.avatar} />}
    </div>
  );
};