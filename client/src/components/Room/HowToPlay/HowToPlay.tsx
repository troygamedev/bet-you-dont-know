import styles from "./HowToPlay.module.scss";
import { Button } from "react-bootstrap-buttons";
import "react-bootstrap-buttons/dist/react-bootstrap-buttons.css";
import { useState } from "react";
import Collapsible from "react-collapsible";

const HowToPlay: React.FC = () => {
  const [showRules, setShowRules] = useState(false);
  const onButtonClick = () => {
    setShowRules(!showRules);
  };

  const [openStatuses, setOpenStatuses] = useState<Array<boolean>>([
    false,
    false,
    false,
  ]);
  const trigger = (triggerName: string, index: number) => {
    const onTriggerClick = () => {
      let shallowCopy = [...openStatuses];
      shallowCopy[index] = !shallowCopy[index];
      setOpenStatuses(shallowCopy);
    };
    return (
      <div className={styles.trigger} onClick={() => onTriggerClick()}>
        <div className={styles.triggerTitle}>{triggerName}</div>
        {openStatuses[index] ? (
          <img src="/img/up-arrow.svg" alt="close" />
        ) : (
          <img src="/img/down-arrow.svg" alt="open" />
        )}
      </div>
    );
  };
  return (
    <div className={styles.container}>
      {showRules && (
        <div className={styles.rulesContainer}>
          <Collapsible
            trigger={trigger("Rules", 0)}
            classParentString={styles.collapsible}
            contentInnerClassName={styles.content}
          >
            <p>Players take turns answering trivia questions.</p>
            <p>On your turn:</p>
            <ol className={styles.orderedList}>
              <li>Answer the trivia question displayed. (multiple choice)</li>
              <li>
                All other players can place bets hoping that you answered
                incorrectly.
              </li>
              <li>
                If their prediction was right (you got the question wrong), you
                will have to pay however much they betted on you.
              </li>
              <li>
                However, if you proved them wrong and answered correctly, you
                will earn $1000 AND everyone who didn't believe in you will have
                to pay their bets to you!
              </li>
            </ol>
          </Collapsible>

          <Collapsible
            trigger={trigger("Example", 1)}
            classParentString={styles.collapsible}
            contentInnerClassName={styles.content}
          >
            <ol className={styles.orderedList}>
              <p>It's Bob's turn to answer:</p>
              <li>
                Bob answers the question: What is 1+1? Bob bluffs that he can't
                do math.
              </li>
              <li>
                John believes that Bob is indeed bad at math and bets $500 that
                Bob will answer incorrectly.
              </li>
              <li>
                No way! Bob guessed correctly and won $1000. Additionally,
                because John made an incorrect prediction, $500 is deducted from
                his balance and given to Bob!
              </li>
            </ol>
          </Collapsible>
          <Collapsible
            trigger={trigger("Tips", 2)}
            classParentString={styles.collapsible}
            contentInnerClassName={styles.content}
          >
            <ol className={styles.orderedList}>
              <li>
                If you have no idea as to what the answer is, try bluffing and
                you can potentially lose $0 because nobody would risk placing
                any bets!
              </li>
              <li>
                If you know what the answer is for sure, try bluffing and you
                can potentially earn much more money from other players' bets!
              </li>
              <li>
                Always choose an answer on your turn: you have a 25% of
                answering correctly!
              </li>
              <li>
                Try not to bet all in - you can't place any more bets once your
                balance dips below zero.
              </li>
            </ol>
          </Collapsible>
        </div>
      )}
      <Button
        btnStyle="secondary"
        onClick={() => onButtonClick()}
        className={styles.howToPlayButton}
      >
        How To Play
      </Button>
    </div>
  );
};

export default HowToPlay;
