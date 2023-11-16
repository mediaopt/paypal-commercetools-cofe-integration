import React, { ReactNode } from 'react';
import { sVGLogoWrapper } from '../logos/svgLogoWrapper';
import { rasterLogoWrapper } from '../logos/rasterLogoWrapper';

interface Option {
  id?: string;
  label?: string;
  value?: string;
  isDefault?: boolean;
  component: ReactNode;
}

export interface FormRadioGroupProps {
  headline?: string;
  subline?: string;
  options: Option[];
  className?: string;
  onChange?: (val: string) => void;
  activePaymentMethod?: string;
}

export default function FormRadioGroup({
  headline,
  subline,
  options,
  onChange,
  className = '',
  activePaymentMethod,
}: FormRadioGroupProps) {
  return (
    <div className={className}>
      <label className="text-base font-medium text-gray-900 dark:text-light-100">{headline}</label>
      <p className="text-sm leading-5 text-gray-500">{subline}</p>
      <fieldset className="mt-4">
        <legend className="sr-only">{headline}</legend>
        <div className="space-y-4">
          {options.map(({ id, value, label, isDefault, component }, index) => (
            <div key={index} className="grid gap-2">
              <div key={index} className="flex items-center">
                <input
                  id={id}
                  name="notification-method"
                  type="radio"
                  defaultChecked={isDefault}
                  value={value}
                  className="h-4 w-4 cursor-pointer border-gray-300 text-accent-400 focus:ring-accent-400"
                  onChange={({ target }) => onChange(target.value)}
                />
                <label
                  htmlFor={id}
                  className="my-auto ml-5 flex h-7 w-fit max-w-full cursor-pointer items-center text-sm font-medium text-gray-700 dark:text-light-100"
                >
                  {sVGLogoWrapper[id] ?? rasterLogoWrapper(id) ?? <span className="m-auto">{label}</span>}
                </label>
              </div>
              {activePaymentMethod === value && component}
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
