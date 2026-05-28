import { useState } from 'react';
import { ShoppingBag, Coins, Check, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { REWARD_ITEMS, purchaseReward } from '../data/rewards';

export default function RewardStore({ state, setState }) {
  const [confirmItem, setConfirmItem] = useState(null);

  const handlePurchase = (itemId) => {
    const result = purchaseReward(state.gold, itemId, state.purchasedRewards);
    if (result.success) {
      setState(prev => ({
        ...prev,
        gold: result.gold,
        purchasedRewards: result.purchasedItems,
        systemMessages: [
          ...prev.systemMessages,
          {
            type: 'reward',
            title: 'REWARD ACQUIRED',
            subtitle: result.message,
            message: 'You earned this through your grind. Enjoy it.',
          },
        ],
      }));
    }
    setConfirmItem(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 relative z-10">
      {/* Header */}
      <div className="glass-panel-strong p-4 flex items-center justify-between relative">
        <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-cyan-400/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-cyan-400/30" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-cyan-400/30" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-cyan-400/30" />

        <div className="flex items-center gap-3">
          <ShoppingBag size={24} className="text-yellow-400" />
          <div>
            <div className="font-orbitron font-bold text-cyan-200 tracking-wider">SYSTEM STORE</div>
            <div className="text-[10px] text-cyan-500/50 tracking-widest uppercase">Spend your hard-earned gold</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-yellow-900/20 border border-yellow-600/30 px-4 py-2 rounded-lg">
          <Coins size={18} className="text-yellow-400" />
          <span className="font-bold text-yellow-400">{state.gold.toLocaleString()}</span>
          <span className="text-[10px] text-yellow-600/70 uppercase tracking-wider">Gold</span>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {REWARD_ITEMS.map(item => {
          const canAfford = state.gold >= item.cost;
          const isConfirming = confirmItem === item.id;

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className={`glass-panel p-4 border ${
                canAfford ? 'border-cyan-500/20' : 'border-cyan-900/20 opacity-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-cyan-100">{item.name}</div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Coins size={14} />
                  <span className="font-bold">{item.cost}</span>
                </div>
              </div>
              <div className="text-xs text-cyan-400/40 mb-3">{item.description}</div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] px-2 py-1 rounded uppercase tracking-wider ${
                  item.category === 'education' ? 'bg-purple-900/20 text-purple-400/70 border border-purple-700/30' :
                  item.category === 'food' ? 'bg-orange-900/20 text-orange-400/70 border border-orange-700/30' :
                  item.category === 'charity' ? 'bg-green-900/20 text-green-400/70 border border-green-700/30' :
                  'bg-cyan-900/20 text-cyan-400/70 border border-cyan-700/30'
                }`}>
                  {item.category}
                </span>

                {isConfirming ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePurchase(item.id)}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-3 py-1 rounded transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmItem(null)}
                      className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs px-3 py-1 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => canAfford && setConfirmItem(item.id)}
                    disabled={!canAfford}
                    className={`text-xs px-3 py-1 rounded transition-colors ${
                      canAfford
                        ? 'bg-cyan-900/30 hover:bg-cyan-800/40 text-cyan-400 border border-cyan-600/30'
                        : 'bg-cyan-950/50 text-cyan-700 cursor-not-allowed border border-cyan-900/30'
                    }`}
                  >
                    {canAfford ? 'Purchase' : <span className="flex items-center gap-1"><Lock size={12} /> Locked</span>}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Purchase History */}
      {state.purchasedRewards.length > 0 && (
        <div className="glass-panel p-4">
          <div className="text-xs font-semibold text-cyan-300/60 mb-3 tracking-wider uppercase">Purchase History</div>
          <div className="space-y-2">
            {state.purchasedRewards.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-cyan-400" />
                  <span className="text-cyan-200">{item.name}</span>
                </div>
                <span className="text-cyan-500/40 text-xs">
                  {new Date(item.purchasedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
