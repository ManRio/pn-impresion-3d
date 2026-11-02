'use client';

import { useState } from 'react';

type Category = {
  id: string;
  name: string;
  parentId: string | null;
};

type Props = {
  categories: Category[];
  defaultValue?: string;
};

const inputClass =
  'mt-2 w-full rounded-lg border border-white/15 bg-[#101319] px-4 py-3 text-white outline-none focus:border-[#B5FF67]';

export default function CategorySelector({
  categories,
  defaultValue = '',
}: Props) {
  const selectedCategory = categories.find(
    (category) => category.id === defaultValue,
  );

  const initialParentId =
    selectedCategory?.parentId ?? selectedCategory?.id ?? '';

  const [parentId, setParentId] = useState(initialParentId);
  const [categoryId, setCategoryId] = useState(defaultValue);

  const roots = categories.filter((category) => category.parentId === null);

  const children = categories.filter(
    (category) => category.parentId === parentId,
  );

  function changeParent(id: string) {
    setParentId(id);

    const hasChildren = categories.some((category) => category.parentId === id);

    setCategoryId(hasChildren ? '' : id);
  }

  return (
    <>
      <label className='block text-sm'>
        Categoría principal
        <select
          value={parentId}
          onChange={(event) => changeParent(event.target.value)}
          required
          className={inputClass}
        >
          <option value='' disabled>
            Selecciona una categoría
          </option>

          {roots.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      {children.length > 0 && (
        <label className='block text-sm'>
          Subcategoría
          <select
            name='categoryId'
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            required
            className={inputClass}
          >
            <option value='' disabled>
              Selecciona una subcategoría
            </option>

            {children.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {children.length === 0 && (
        <input type='hidden' name='categoryId' value={categoryId} />
      )}
    </>
  );
}
