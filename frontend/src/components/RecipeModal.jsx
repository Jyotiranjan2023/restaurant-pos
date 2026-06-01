import { useState, useEffect } from 'react';
import { fetchRecipe, addRecipeItem, removeRecipeItem, fetchIngredients } from '../services/inventoryService';

const UNIT_LABELS = {
  GRAM: 'g', KILOGRAM: 'kg',
  MILLILITER: 'ml', LITER: 'L',
  PIECE: 'pcs', PACKET: 'pkt',
};

export default function RecipeModal({ product, onClose }) {
  const [recipe,      setRecipe]      = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [successMsg,  setSuccessMsg]  = useState('');

  // Add form
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [quantity,              setQuantity]              = useState('');
  const [adding,                setAdding]                = useState(false);
  const [addError,              setAddError]              = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [recipeData, ingredientsData] = await Promise.all([
        fetchRecipe(product.id),
        fetchIngredients(),
      ]);
      setRecipe(recipeData || []);
      setIngredients(ingredientsData || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [product.id]);

  // Auto-clear success
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(''), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const handleAdd = async () => {
    setAddError('');
    if (!selectedIngredientId) { setAddError('Select an ingredient'); return; }
    if (!quantity || parseFloat(quantity) <= 0) { setAddError('Enter a valid quantity'); return; }
    setAdding(true);
    try {
      await addRecipeItem(product.id, Number(selectedIngredientId), parseFloat(quantity));
      setSelectedIngredientId('');
      setQuantity('');
      setSuccessMsg('Ingredient added to recipe');
      await load();
    } catch (err) {
      setAddError(err?.response?.data?.message || 'Failed to add ingredient');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (ingredientId, ingredientName) => {
    if (!window.confirm(`Remove ${ingredientName} from recipe?`)) return;
    try {
      await removeRecipeItem(product.id, ingredientId);
      setSuccessMsg(`${ingredientName} removed from recipe`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove ingredient');
    }
  };

  // Ingredients not already in recipe
  const availableIngredients = ingredients.filter(
    ing => !recipe.some(r => r.ingredientId === ing.id)
  );

  const selectedIngredient = ingredients.find(i => i.id === Number(selectedIngredientId));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Recipe</h2>
            <p className="text-xs text-gray-500 mt-0.5">{product.name}</p>
          </div>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Success */}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {successMsg}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-2 rounded-lg">
            💡 When an order is placed, these ingredients will be automatically deducted from stock.
          </div>

          {/* Current recipe */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">
              Current ingredients ({recipe.length})
            </p>

            {loading ? (
              <div className="space-y-2">
                {[1,2].map(i => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recipe.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-400">No ingredients added yet</p>
                <p className="text-xs text-gray-300 mt-1">Add ingredients below to enable stock deduction</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recipe.map(item => (
                  <div key={item.ingredientId}
                    className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.ingredientName}</p>
                      <p className="text-xs text-gray-500">
                        {Number(item.quantityPerServing).toFixed(3)} {UNIT_LABELS[item.unit] || item.unit} per serving
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(item.ingredientId, item.ingredientName)}
                      className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add ingredient */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Add ingredient</p>

            {addError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg mb-2">
                {addError}
              </div>
            )}

            {availableIngredients.length === 0 && !loading ? (
              <p className="text-xs text-gray-400 text-center py-3">
                All available ingredients are already in this recipe.
              </p>
            ) : (
              <div className="space-y-2">
                <select
                  value={selectedIngredientId}
                  onChange={e => { setSelectedIngredientId(e.target.value); setAddError(''); }}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">Select ingredient…</option>
                  {availableIngredients.map(ing => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} (stock: {Number(ing.currentStock).toFixed(1)} {UNIT_LABELS[ing.unit]})
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={quantity}
                      onChange={e => { setQuantity(e.target.value); setAddError(''); }}
                      placeholder="Qty per serving"
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    {selectedIngredient && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        {UNIT_LABELS[selectedIngredient.unit]}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleAdd}
                    disabled={adding}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0"
                  >
                    {adding ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    )}
                    {adding ? 'Adding…' : 'Add'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button onClick={onClose}
            className="w-full py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}