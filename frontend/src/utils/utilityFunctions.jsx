export const addIsSelected = (data, defaultValue = false) => {
  if (!data) return null;
  const newData = data?.map((item) => {
    return { ...item, isSelected: defaultValue };
  });
  return newData;
};
