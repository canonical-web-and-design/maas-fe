import type { ReactNode } from "react";

import classNames from "classnames";

type StepperItem = {
  step: string;
  title: ReactNode;
};

type Props = {
  currentStep: string;
  items: StepperItem[];
};

export const Stepper = ({ currentStep, items }: Props): JSX.Element => {
  return (
    <ol className="stepper">
      {items.map((item, i) => {
        const isActive = item.step === currentStep;
        const isComplete =
          items.findIndex(({ step }) => step === currentStep) > i;
        return (
          <li className="stepper__item" key={item.step}>
            <p
              aria-checked={isComplete}
              className={classNames("stepper__title", {
                "is-active": isActive,
                "is-complete": isComplete,
              })}
            >
              {item.title}
            </p>
          </li>
        );
      })}
    </ol>
  );
};

export default Stepper;
