interface Variable {
	type: 'boolean' | 'text';
	name: string;
	value: boolean | string;
}

interface VariableListProps {
	items: Variable[];
	onChange?: (updatedItems: Variable[]) => void;
}

export const VariableList = (props: VariableListProps) => {
	return (
		<section className="grid auto-rows-fr grid-cols-1" role="list">
			{props.items.map((item) => (
				<div key={item.name}>
					<span>{item.name}</span>
					<span>{item.value}</span>
				</div>
			))}
		</section>
	);
};
