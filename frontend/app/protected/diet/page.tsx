"use client"

import { useState } from 'react'
import Button from '@/app/components/ui/Button'
import { Utensils, HeartPulse, ChefHat, Info } from 'lucide-react'
import { toast } from 'react-toastify'

// --- TypeScript Interfaces ---
interface RecipeStep {
    stepNumber: number;
    instruction: string;
}

interface MealWithRecipe {
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foodName: string;
    calories: number;
    benefits: string;
    prepTime: string;
    ingredients: string[];
    recipeSteps: RecipeStep[];
}

interface DietPlanApiResponse {
    total_calories: number;
    safety_verdict: "safe" | "caution";
    dietary_breakdown: string;
    safety_notes: string;
    generated_menu: Array<{
        type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
        food_name: string;
        calories: number;
        benefits: string;
        prep_time: string;
        ingredients: string[];
        recipe_steps: Array<{ step: number; text: string }>;
    }>;
}

const DietPage = () => {
    // --- State Management ---
    const [userVibeInput, setUserVibeInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedMealIndex, setSelectedMealIndex] = useState<number | null>(null);

    // Dynamic generated data state
    const [planData, setPlanData] = useState<{
        safetyNotes: string;
        menu: MealWithRecipe[];
    }>({
        safetyNotes: "Type what you're craving or how you feel above to generate your customized day plan.",
        menu: []
    });

    // --- API Request Logic ---
    const handleGenerateDietPlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userVibeInput.trim()) {
            toast.warning("Tell us what you're craving or feeling so we can customize your meals!", { position: 'top-center' });
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);
        setSelectedMealIndex(null); 

        try {
            const response = await fetch('http://localhost:8000/diet/diet-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    user_expression: userVibeInput.trim()
                }),
            });

            const data: DietPlanApiResponse = await response.json();

            if (!response.ok) throw new Error('Failed to craft your menu matches.');

            setPlanData({
                safetyNotes: data.safety_notes,
                menu: data.generated_menu.map(m => ({
                    mealType: m.type,
                    foodName: m.food_name,
                    calories: m.calories,
                    benefits: m.benefits,
                    prepTime: m.prep_time,
                    ingredients: m.ingredients,
                    recipeSteps: m.recipe_steps.map(s => ({
                        stepNumber: s.step,
                        instruction: s.text
                    }))
                }))
            });

            // Auto-select breakfast if available
            if (data.generated_menu.length > 0) {
                setSelectedMealIndex(0); 
            }

            toast.success('Your pregnancy-safe day menu is ready!', { position: 'top-center', autoClose: 2000 });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to balance a plan for that input right now.';
            setErrorMessage(message);
            toast.error(message, { position: 'top-center' });
        } finally {
            setIsLoading(false);
        }
    };

    // Helper layout mapping for fixed types
    const fixedMealTypes: Array<'breakfast' | 'lunch' | 'dinner'> = ['breakfast', 'lunch', 'dinner'];

    return (
        <div className="flex flex-col h-full w-full p-5 max-h-screen box-border bg-slate-50/60">
            {/* Minimal Maternal Header */}
            <div className="flex-shrink-0 text-center mb-5">
                <h2 className='text-3xl text-slate-600 font-semibold flex items-center justify-center gap-2'>
                    <HeartPulse className="text-emerald-500" size={30} /> Smart Pregnancy Diet Planner
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">
                    No complicated forms. Just tell us what you feel like eating or any symptoms you have.
                </p>
            </div>

            {/* Top Bar Input Box */}
            <form onSubmit={handleGenerateDietPlan} className="w-full max-w-4xl mx-auto flex gap-3 items-center bg-white shadow-sm p-3 rounded-xl border border-slate-100 flex-shrink-0 mb-5">
                <div className="flex-1">
                    <input 
                        type="text" 
                        placeholder="e.g., 'Feeling nauseous but craving something savory' or 'I want something with chocolate and strawberries'"
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={userVibeInput}
                        onChange={(e) => setUserVibeInput(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <Button 
                    text={isLoading ? "Crafting Menu..." : "Plan My Day"}
                    type="submit"
                    className="bg-emerald-400 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-lg text-sm flex-shrink-0 flex items-center gap-2 transition-colors shadow-sm"
                    disabled={isLoading}
                />
            </form>

            {/* Split Screen Layout */}
            <div className="flex-1 min-h-0 flex gap-6 items-stretch w-full max-w-7xl mx-auto justify-center pb-3">
                
                {/* Left Side: Breakfast, Lunch, Dinner Menu List */}
                <div className="w-[45%] shadow p-5 bg-white rounded-xl border border-slate-100 flex flex-col min-h-0">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4 flex-shrink-0">
                        <Utensils size={14} className="text-slate-400"/> Your Personal Daily Menu
                    </h3>

                    <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1">
                        {fixedMealTypes.map((type) => {
                            // Match generated active data against current loop type 
                            const matchedIndex = planData.menu.findIndex(m => m.mealType === type);
                            const hasData = matchedIndex !== -1;
                            const item = hasData ? planData.menu[matchedIndex] : null;
                            const isSelected = hasData && selectedMealIndex === matchedIndex;

                            return (
                                <button
                                    key={type}
                                    type="button"
                                    disabled={!hasData}
                                    onClick={() => hasData && setSelectedMealIndex(matchedIndex)}
                                    className={`w-full text-left p-4 rounded-lg border transition-all flex flex-col gap-1 ${
                                        !hasData 
                                            ? 'bg-slate-50/50 border-slate-100/70 opacity-60 cursor-not-allowed'
                                            : isSelected 
                                                ? 'bg-emerald-50/60 border-emerald-200 ring-1 ring-emerald-200 cursor-pointer' 
                                                : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70 cursor-pointer'
                                    }`}
                                >
                                    <div className="flex justify-between items-center w-full">
                                        <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded ${
                                            isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200/70 text-slate-600'
                                        }`}>
                                            {type}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400">
                                            {item ? `${item.calories} kcal` : '-'}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 mt-1">
                                        {item ? item.foodName : '-'}
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-medium truncate w-full mt-0.5">
                                        {item ? `★ ${item.benefits}` : '-'}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side: Step-by-Step Recipe Guide Panel (Takes 55% width) */}
                <div className="w-[55%] bg-white rounded-xl flex flex-col p-5 overflow-y-auto shadow border border-slate-100 min-h-0">
                    {selectedMealIndex !== null && planData.menu[selectedMealIndex] ? (
                        <div className="flex flex-col gap-4">
                            {/* Recipe Header */}
                            <div className="border-b border-slate-100 pb-3 flex-shrink-0">
                                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                    {planData.menu[selectedMealIndex].mealType} Recipe Guide
                                </span>
                                <h2 className="text-xl font-bold text-slate-700 mt-1 flex items-center gap-2">
                                    <ChefHat size={22} className="text-slate-500" /> {planData.menu[selectedMealIndex].foodName}
                                </h2>
                                <p className="text-xs text-slate-400 mt-1 font-medium">Estimated preparation time: {planData.menu[selectedMealIndex].prepTime}</p>
                            </div>

                            {/* Recipe Ingredients */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Safe Ingredients List</h4>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {planData.menu[selectedMealIndex].ingredients.map((ing, i) => (
                                        <div key={i} className="text-xs text-slate-600 bg-slate-50 border border-slate-100/70 p-2 rounded-md flex items-center gap-1.5">
                                            <span className="h-1 w-1 bg-emerald-400 rounded-full flex-shrink-0"></span>
                                            {ing}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Preparation Instructions */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Cooking Instructions</h4>
                                <div className="flex flex-col gap-3">
                                    {planData.menu[selectedMealIndex].recipeSteps.map((step) => (
                                        <div key={step.stepNumber} className="flex gap-3 items-start text-sm">
                                            <span className="flex-shrink-0 bg-slate-100 text-slate-600 font-bold rounded-md h-5 w-5 flex items-center justify-center text-xs mt-0.5">
                                                {step.stepNumber}
                                            </span>
                                            <p className="text-slate-600 text-xs leading-relaxed mt-0.5">{step.instruction}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Guidance Footnote */}
                            <div className="mt-2 bg-emerald-50/30 border border-emerald-100/50 p-3 rounded-lg flex gap-2.5 items-start">
                                <Info size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-slate-600 leading-relaxed">
                                    <strong className="text-slate-700">Maternal Notice:</strong> {planData.safetyNotes}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-100 rounded-xl p-8">
                            <ChefHat size={36} className="text-slate-200 mb-2" />
                            <p className="text-sm text-slate-500 font-medium">No meal selected</p>
                            <p className="text-xs text-slate-400 text-center max-w-xs mt-0.5">Enter how you feel or what you crave in the box above to generate dynamic, safe culinary recipes.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default DietPage;