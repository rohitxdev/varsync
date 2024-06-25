export const LOCALE_UK = 'en-GB';

export const getRandomNumber = (min: number, max: number, truncate = true) => {
	const val = min + Math.random() * (max - min);
	return truncate ? Math.trunc(val) : val;
};

export const numFormatter = new Intl.NumberFormat(LOCALE_UK, {
	notation: 'compact',
	maximumSignificantDigits: 3,
});
