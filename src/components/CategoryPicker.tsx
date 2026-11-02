import {categoryGroups,type CategoryOption} from '@/lib/category-tree';
export default function CategoryPicker({categories,defaultValue='',className=''}:{categories:CategoryOption[];defaultValue?:string;className?:string}){
 const groups=categoryGroups(categories);
 return <select name="categoryId" defaultValue={defaultValue} required className={className}>
 <option value="" disabled>Selecciona categoría o subcategoría</option>
 {groups.map(group=><optgroup key={group.root.id} label={group.root.name}>
 <option value={group.root.id}>{group.root.name} (principal)</option>
 {group.children.map(child=><option key={child.id} value={child.id}>↳ {child.name}</option>)}
 </optgroup>)}
 </select>;
}
