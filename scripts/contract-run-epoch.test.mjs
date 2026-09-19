import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';

function storage() {
  const data = new Map();
  return { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,String(v)), removeItem: k => data.delete(k), clear: () => data.clear(), data };
}

test('all selected contracts own run mechanics without replacing campaign or research provenance', async () => {
  const saved = Object.fromEntries(['window','location','localStorage','sessionStorage','__GR_RELEASE_E1__'].map(k => [k,globalThis[k]]));
  const local = storage(), session = storage();
  Object.assign(globalThis,{localStorage:local,sessionStorage:session,__GR_RELEASE_E1__:false});
  const navigate = search => { globalThis.location = new URL(`http://epoch.test/${search}`);globalThis.window = { location:globalThis.location }; };
  navigate('');
  const vite = await createServer({configFile:false,appType:'custom',logLevel:'silent',optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,watch:null}});
  try {
    const registry = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const research = await vite.ssrLoadModule('/src/meta/ResearchTree.ts');
    const unlock = await vite.ssrLoadModule('/src/meta/ContractUnlock.ts');
    const {currentMultiplayerSetup} = await vite.ssrLoadModule('/src/mp/RideTogether.ts');
    const {MEGAPROJECT_STATE_KEY} = await vite.ssrLoadModule('/src/meta/Megaproject.ts');
    const {ACTIVE_EPOCH_KEY,DEFAULT_EPOCH_ID,activeEpochId,campaignEpochId,epochIsActive,stagePlayerContractLaunch,clearPlayerContractLaunch,stageReplayContract,activeContract,listEpochs,loadEpoch,activateEpoch} = registry;
    local.setItem(ACTIVE_EPOCH_KEY,DEFAULT_EPOCH_ID);
    const frontier = research.loadResearchState(local,local,{},DEFAULT_EPOCH_ID);
    const originalFrontier = local.getItem(research.researchStateKey(DEFAULT_EPOCH_ID));
    let contracts=0;
    for (const epoch of listEpochs()) for (const contract of loadEpoch(epoch.id).contracts) {
      navigate(`?contract=${contract.id}`);stagePlayerContractLaunch(contract.id);
      assert.equal(activeContract().id,contract.id);
      assert.equal(activeEpochId(),epoch.id,contract.id);
      assert.equal(campaignEpochId(),DEFAULT_EPOCH_ID);assert.equal(epochIsActive(epoch.id),epoch.id===DEFAULT_EPOCH_ID,'run context must not open campaign gates');
      const state = research.loadResearchState(local,local);
      assert.equal(state.epochId,epoch.id);
      research.saveResearchRegistryState(local,state,local);
      if (epoch.id!==DEFAULT_EPOCH_ID) assert.equal(JSON.parse(local.getItem(research.researchStateKey(epoch.id))).campaignPending,true);
      research.reconcileActiveEpoch(local);
      assert.equal(campaignEpochId(),DEFAULT_EPOCH_ID,'visiting/researching a later map must not skip a ceremony');
      contracts++;
    }
    assert.equal(contracts,42);
    assert.equal(local.getItem(research.researchStateKey(DEFAULT_EPOCH_ID)),originalFrontier);
    navigate('?contract=e5-regatta');stagePlayerContractLaunch('e5-regatta');
    assert.equal(unlock.contractUnlockStatus(registry.loadContract('e5-regatta')).unlocked,false);
    unlock.reverifyStagedContractLaunch();assert.equal(registry.stagedPlayerContractLaunch(),null);assert.equal(activeContract().id,'the-claim');
    clearPlayerContractLaunch();navigate('');assert.equal(activeEpochId(),DEFAULT_EPOCH_ID);
    navigate('?contract=e5-regatta');assert.equal(activeContract().id,'the-claim');assert.equal(activeEpochId(),DEFAULT_EPOCH_ID,'unauthorized URL must use its actual fallback');
    navigate('?debug&contract=not-a-map');assert.equal(activeContract().id,'the-claim');assert.equal(activeEpochId(),DEFAULT_EPOCH_ID);
    navigate('?debug&epoch=epoch-3-voltage&contract=e5-regatta');assert.equal(activeEpochId(),'epoch-3-voltage','explicit debug experiments retain their epoch override');
    stageReplayContract('e8-mare-claim');assert.equal(activeContract().id,'e8-mare-claim');assert.equal(activeEpochId(),'epoch-8-orbital','replay owns context even over debug epoch');stageReplayContract(null);
    navigate('?contract=e5-regatta');stagePlayerContractLaunch('e5-regatta');
    local.setItem(MEGAPROJECT_STATE_KEY,JSON.stringify({version:1,projects:{[loadEpoch(DEFAULT_EPOCH_ID).megaproject.id]:{complete:true}}}));
    assert.equal(activateEpoch('epoch-2-steamworks'),true,'ordinary earned successor activation still works');
    assert.equal(campaignEpochId(),'epoch-2-steamworks');assert.equal(activeEpochId(),'epoch-5-deepwater');
    // Playing an old map cannot downgrade the saved campaign through activateEpoch.
    local.setItem(ACTIVE_EPOCH_KEY,'epoch-5-deepwater');navigate('?contract=the-claim');stagePlayerContractLaunch('the-claim');
    local.setItem(MEGAPROJECT_STATE_KEY,JSON.stringify({version:1,projects:{[loadEpoch(DEFAULT_EPOCH_ID).megaproject.id]:{complete:true}}}));
    assert.equal(activeEpochId(),DEFAULT_EPOCH_ID);assert.equal(activateEpoch('epoch-2-steamworks'),false);assert.equal(campaignEpochId(),'epoch-5-deepwater');
    research.loadResearchState(local,local,{},'epoch-5-deepwater');
    assert.notEqual(JSON.parse(local.getItem(research.researchStateKey('epoch-5-deepwater'))).campaignPending,true,'reaching the era promotes its registry provenance');
    clearPlayerContractLaunch();navigate('');assert.equal(activeEpochId(),'epoch-5-deepwater');
    // Legacy earned registries still recover a lost pointer; pending future records do not.
    local.setItem(ACTIVE_EPOCH_KEY,DEFAULT_EPOCH_ID);research.reconcileActiveEpoch(local);assert.equal(campaignEpochId(),'epoch-5-deepwater');
    local.clear();local.setItem(research.researchStateKey('epoch-2-steamworks'),JSON.stringify({version:1,steps:2,taken:[],proposalSalt:0}));research.reconcileActiveEpoch(local);assert.equal(campaignEpochId(),'epoch-2-steamworks');
    // The passed storage, not a different profile's global campaign, owns provenance.
    const other=storage();other.setItem(ACTIVE_EPOCH_KEY,'epoch-7-signal');local.setItem(ACTIVE_EPOCH_KEY,DEFAULT_EPOCH_ID);
    research.loadResearchState(other,other,{},'epoch-5-deepwater');assert.notEqual(JSON.parse(other.getItem(research.researchStateKey('epoch-5-deepwater'))).campaignPending,true);
    other.clear();other.setItem(ACTIVE_EPOCH_KEY,DEFAULT_EPOCH_ID);local.setItem(ACTIVE_EPOCH_KEY,'epoch-7-signal');
    research.loadResearchState(other,other,{},'epoch-5-deepwater');assert.equal(JSON.parse(other.getItem(research.researchStateKey('epoch-5-deepwater'))).campaignPending,true);
    research.reconcileActiveEpoch(other);assert.equal(other.getItem(ACTIVE_EPOCH_KEY),DEFAULT_EPOCH_ID);
    for(const campaign of [DEFAULT_EPOCH_ID,'epoch-5-deepwater','epoch-10-deepsky'])for(const id of ['the-claim','e5-regatta']){
      local.setItem(ACTIVE_EPOCH_KEY,campaign);navigate('');clearPlayerContractLaunch();
      const town=currentMultiplayerSetup(id);navigate(`?contract=${id}`);stagePlayerContractLaunch(id);
      assert.deepEqual(currentMultiplayerSetup(id),town,'room and run handshakes must agree');assert.equal(town.research.epochId,registry.contractEpochId(id));
    }
    local.clear();session.clear();local.setItem(ACTIVE_EPOCH_KEY,'epoch-2-steamworks');
    const tour=await vite.ssrLoadModule('/src/meta/DebugEraSeed.ts');
    const openTour=(search)=>{navigate(search);window.history={state:null,replaceState:(_state,_title,url)=>navigate(url)};};
    openTour('?contract=e9-dome-basin&debug&era=9');const canvas={dataset:{}};
    assert.equal(tour.seedDebugEraFromSearch(canvas),9);assert.equal(campaignEpochId(),'epoch-9-redfields');assert.equal(canvas.dataset.seededEra,'9');
    openTour('?contract=e6-showroom&debug&era=6');assert.equal(tour.seedDebugEraFromSearch(canvas),6);assert.equal(campaignEpochId(),'epoch-9-redfields','earlier debug tour cannot downgrade campaign');
    assert.equal(activeEpochId(),'epoch-6-atomic');
    assert.equal(frontier.epochId,DEFAULT_EPOCH_ID);
  } finally {
    await vite.close();
    for(const [k,v]of Object.entries(saved)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}
  }
});
