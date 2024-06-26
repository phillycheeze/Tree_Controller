﻿// <copyright file="DestroyFoliageSystem.cs" company="Yenyangs Mods. MIT License">
// Copyright (c) Yenyangs Mods. MIT License. All rights reserved.
// </copyright>

#define BURST

namespace Tree_Controller.Systems
{
    using Colossal.Logging;
    using Game;
    using Game.Common;
    using Game.Objects;
    using Game.Tools;
    using Unity.Burst;
    using Unity.Burst.Intrinsics;
    using Unity.Collections;
    using Unity.Entities;
    using Unity.Jobs;

    /// <summary>
    /// A system for removing tree and foliage entities from the current world.
    /// </summary>
    public partial class DestroyFoliageSystem : GameSystemBase
    {
        private ToolOutputBarrier m_ToolOutputBarrier;
        private EntityQuery m_allFoliageQuery;
        private ILog m_Log;

        /// <summary>
        /// Initializes a new instance of the <see cref="DestroyFoliageSystem"/> class.
        /// </summary>
        public DestroyFoliageSystem()
        {
        }

        /// <inheritdoc/>
        protected override void OnCreate()
        {
            base.OnCreate();
            m_Log = TreeControllerMod.Instance.Logger;

            m_ToolOutputBarrier = World.GetOrCreateSystemManaged<ToolOutputBarrier>();

            // Disable system for safety reasons, only enable explictly during triggered action.
            Enabled = false;
            m_Log.Info($"{nameof(DestroyFoliageSystem)}.{nameof(OnCreate)}");

            m_allFoliageQuery = SystemAPI.QueryBuilder()
                .WithAnyRW<Tree, Plant>()
                .WithNone<Owner, Deleted>()
                .Build();
            RequireForUpdate(m_allFoliageQuery);
        }

        /// <inheritdoc/>
        protected override void OnUpdate()
        {
            m_Log.Info($"{nameof(DestroyFoliageSystem)}.{nameof(OnUpdate)} invoked.");
            if (m_allFoliageQuery.IsEmptyIgnoreFilter)
            {
                m_Log.Info($"{nameof(DestroyFoliageSystem)}.{nameof(OnUpdate)} invoked but no foliage found via query builder.");
                return;
            }

            m_Log.Debug($"{nameof(DestroyFoliageSystem)}.{nameof(OnUpdate)} building parallel job.");
            DestroyFoliageEntitiesJob destroyFoliageEntitiesJob = new ()
            {
                m_EntityType = SystemAPI.GetEntityTypeHandle(),
                buffer = m_ToolOutputBarrier.CreateCommandBuffer().AsParallelWriter(),
            };

            JobHandle jobHandle = JobChunkExtensions.ScheduleParallel(destroyFoliageEntitiesJob, m_allFoliageQuery, Dependency);
            m_ToolOutputBarrier.AddJobHandleForProducer(jobHandle);
            Dependency = jobHandle;

            m_Log.Debug($"{nameof(DestroyFoliageSystem)}.{nameof(OnUpdate)} parallel job submitted.");

            // Disable system for safety reasons, only enable explictly during triggered action.
            Enabled = false;
        }

#if BURST
        [BurstCompile]
#endif
        private struct DestroyFoliageEntitiesJob : IJobChunk
        {
            [ReadOnly]
            public EntityTypeHandle m_EntityType;
            public EntityCommandBuffer.ParallelWriter buffer;

            public void Execute(in ArchetypeChunk chunk, int unfilteredChunkIndex, bool useEnabledMask, in v128 chunkEnabledMask)
            {
                NativeArray<Entity> entityNativeArray = chunk.GetNativeArray(m_EntityType);
                for (int i = 0; i < chunk.Count; i++)
                {
                    Entity currentEntity = entityNativeArray[i];
                    buffer.AddComponent<Deleted>(unfilteredChunkIndex, currentEntity, default);
                }
            }
        }
    }
}
