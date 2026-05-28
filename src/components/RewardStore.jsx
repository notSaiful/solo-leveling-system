import { useState } from 'react';
import { ShoppingBag, Coins, Check, Lock, Sparkles, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { REWARD_ITEMS, REWARD_RARITY, purchaseReward, getStoreItemsForRank, getFeaturedItems, getNextUnlockPreview, isItemUnlocked } from '../data/rewards';

export default function RewardStore({ state, setState }) {
  const [confirmItem, setConfirmItem] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const userRank = state.user.currentRank;

  const allItems = getStoreItemsForRank(userRank);
  const featuredItems = getFeaturedItems(userRank);
  const nextUnlock = getNextUnlockPreview(userRank);

  const filteredItems = activeFilter === 'all'
    ? allItems
    : activeFilter === 'locked'
      ? allItems.filter(i => !i.unlocked)
      : allItems.filter(i => i.category === activeFilter);

  const categories = ['all', 'food', 'education', 'fitness', 'tech', 'travel', 'charity', 'wealth', 'luxury', 'wellness', 'entertainment', 'locked'];

  const handlePurchase = (itemId) => {
    const result = purchaseReward(state.gold, itemId, state.purchasedRewards);
    if (result.success) {
      const item = REWARD_ITEMS.find(i => i.id === itemId);
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
            message: `Rank: ${REWARD_RARITY[item.rarity]?.label || item.rarity} | ${item.description}`,
          },
        ],
      }));
    }
    setConfirmItem(null);
  };

  return (
    <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto p-2 sm:p-4 space-y-4 relative z-10">
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

      {/* Rank Indicator */}
      <div className="glass-panel p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={16} className={`text-rank-${userRank.toLowerCase()}`} />
          <span className="text-sm text-cyan-300">Your Rank: <span className={`font-bold text-rank-${userRank.toLowerCase()}`}>{userRank}-Rank</span></span>
        </div>
        <div className="text-xs text-cyan-500/50">
          {allItems.filter(i => i.unlocked).length}/{allItems.length} items unlocked
        </div>
      </div>

      {/* Featured Section */}
      {featuredItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300/70 tracking-wider uppercase">
            <Sparkles size={14} className="text-yellow-400" />
            Featured for {userRank}-Rank
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {featuredItems.map(item => {
              const canAfford = state.gold >= item.cost;
              const rarityConfig = REWARD_RARITY[item.rarity];
              const isConfirming = confirmItem === item.id;

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  className={`glass-panel p-4 border ${rarityConfig.border} ${!item.unlocked ? 'opacity-40' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-cyan-100">{item.name}</div>
                      <div className={`text-[10px] uppercase tracking-wider ${rarityConfig.color}`}>{rarityConfig.label}</div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Coins size={14} />
                      <span className="font-bold">{item.cost.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-xs text-cyan-400/40 mb-3">{item.description}</div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-1 rounded uppercase tracking-wider ${rarityConfig.bg} ${rarityConfig.color} border ${rarityConfig.border}`}>
                      {item.category}
                    </span>

                    {!item.unlocked ? (
                      <span className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Lock size={12} /> {item.unlockRank}-Rank
                      </span>
                    ) : isConfirming ? (
                      <div className="flex gap-2">
                        <button onClick={() => handlePurchase(item.id)} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-3 py-1 rounded transition-colors">Confirm</button>
                        <button onClick={() => setConfirmItem(null)} className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs px-3 py-1 rounded transition-colors">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => canAfford && setConfirmItem(item.id)}
                        disabled={!canAfford}
                        className={`text-xs px-3 py-1 rounded transition-colors ${canAfford ? 'bg-cyan-900/30 hover:bg-cyan-800/40 text-cyan-400 border border-cyan-600/30' : 'bg-cyan-950/50 text-cyan-700 cursor-not-allowed border border-cyan-900/30'}`}
                      >
                        {canAfford ? 'Purchase' : <span className="flex items-center gap-1"><Lock size={12} /> Need Gold</span>}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeFilter === cat
                ? 'bg-cyan-900/40 text-cyan-300 border border-cyan-500/30'
                : 'bg-cyan-950/20 text-cyan-600/50 border border-cyan-900/20 hover:text-cyan-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* All Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map(item => {
          const canAfford = state.gold >= item.cost;
          const isConfirming = confirmItem === item.id;
          const rarityConfig = REWARD_RARITY[item.rarity];

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: item.unlocked ? 1.02 : 1 }}
              className={`glass-panel p-4 border ${item.unlocked ? rarityConfig.border : 'border-gray-800/20'} ${!item.unlocked ? 'opacity-30' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-cyan-100">{item.name}</div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Coins size={14} />
                  <span className="font-bold">{item.cost.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-xs text-cyan-400/40 mb-3">{item.description}</div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] px-2 py-1 rounded uppercase tracking-wider ${rarityConfig.bg} ${rarityConfig.color} border ${rarityConfig.border}`}>
                  {rarityConfig.label}
                </span>

                {!item.unlocked ? (
                  <span className="flex items-center gap-1 text-[10px] text-gray-500">
                    <Lock size={12} /> {item.unlockRank}-Rank
                  </span>
                ) : isConfirming ? (
                  <div className="flex gap-2">
                    <button onClick={() => handlePurchase(item.id)} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-3 py-1 rounded transition-colors">Confirm</button>
                    <button onClick={() => setConfirmItem(null)} className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs px-3 py-1 rounded transition-colors">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => canAfford && setConfirmItem(item.id)}
                    disabled={!canAfford}
                    className={`text-xs px-3 py-1 rounded transition-colors ${canAfford ? 'bg-cyan-900/30 hover:bg-cyan-800/40 text-cyan-400 border border-cyan-600/30' : 'bg-cyan-950/50 text-cyan-700 cursor-not-allowed border border-cyan-900/30'}`}
                  >
                    {canAfford ? 'Purchase' : 'Need Gold'}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Next Unlock Teaser */}
      {nextUnlock && (
        <div className="glass-panel p-4 border border-dashed border-cyan-700/30">
          <div className="flex items-center gap-2 text-xs text-cyan-500/70 mb-2">
            <ChevronRight size={14} />
            <span className="uppercase tracking-wider">Unlocks at {nextUnlock.rank}-Rank</span>
          </div>
          <div className="space-y-1">
            {nextUnlock.items.slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center gap-2 text-sm text-cyan-700/50">
                <Lock size={12} />
                <span>{item.name}</span>
                <span className="text-yellow-700/40 text-xs">({item.cost.toLocaleString()} Gold)</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <span className="text-cyan-500/40 text-xs">{new Date(item.purchasedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
