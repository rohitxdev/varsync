import { ComponentProps } from 'react';

interface SwitchProps extends Omit<ComponentProps<'input'>, 'type' | 'onInput'> {}

export const Switch = ({ className, ...rest }: SwitchProps) => {
	return (
		<input
			type="checkbox"
			className={`appearance-none rounded-full p-0.5 box-content w-10 h-5 relative bg-neutral-600 checked:bg-blue-600 before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:size-5 before:bg-white before:z-10 before:rounded-full checked:before:translate-x-full before:duration-100 checked:duration-200 isolate ${className}`}
			{...rest}
		/>
	);
};
