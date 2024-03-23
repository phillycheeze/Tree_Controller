﻿// <copyright file="TreeObjectDefinitionSystem.cs" company="Yenyangs Mods. MIT License">
// Copyright (c) Yenyangs Mods. MIT License. All rights reserved.
// </copyright>

namespace Tree_Controller.Systems
{
    using System;
    using System.Collections.Generic;
    using Colossal.Entities;
    using Colossal.Logging;
    using Colossal.Serialization.Entities;
    using Game;
    using Game.Common;
    using Game.Objects;
    using Game.Prefabs;
    using Game.Tools;
    using Tree_Controller.Tools;
    using Unity.Collections;
    using Unity.Entities;
    using UnityEngine;

    /// <summary>
    /// Overrides tree state on placement with object tool based on setting.
    /// </summary>
    public partial class TreeObjectDefinitionSystem : GameSystemBase
    {
        private readonly Dictionary<TreeState, float> BrushTreeStateAges = new ()
        {
            { 0, 0 },
            { TreeState.Teen, ObjectUtils.TREE_AGE_PHASE_CHILD },
            { TreeState.Adult, ObjectUtils.TREE_AGE_PHASE_CHILD + ObjectUtils.TREE_AGE_PHASE_TEEN },
            { TreeState.Elderly, ObjectUtils.TREE_AGE_PHASE_CHILD + ObjectUtils.TREE_AGE_PHASE_TEEN + ObjectUtils.TREE_AGE_PHASE_ADULT },
            { TreeState.Dead, ObjectUtils.TREE_AGE_PHASE_CHILD + ObjectUtils.TREE_AGE_PHASE_TEEN + ObjectUtils.TREE_AGE_PHASE_ADULT + ObjectUtils.TREE_AGE_PHASE_ELDERLY + .00001f },
        };

        private ToolSystem m_ToolSystem;
        private TreeControllerUISystem m_TreeControllerUISystem;
        private ObjectToolSystem m_ObjectToolSystem;
        private PrefabSystem m_PrefabSystem;
        private EntityQuery m_ObjectDefinitionQuery;
        private TreeControllerTool m_TreeControllerTool;
        private ILog m_Log;

        /// <summary>
        /// Initializes a new instance of the <see cref="TreeObjectDefinitionSystem"/> class.
        /// </summary>
        public TreeObjectDefinitionSystem()
        {
        }

        /// <inheritdoc/>
        protected override void OnCreate()
        {
            base.OnCreate();
            m_Log = TreeControllerMod.Instance.Logger;
            m_ToolSystem = World.DefaultGameObjectInjectionWorld?.GetOrCreateSystemManaged<ToolSystem>();
            m_TreeControllerUISystem = World.DefaultGameObjectInjectionWorld?.GetOrCreateSystemManaged<TreeControllerUISystem>();
            m_ObjectToolSystem = World.DefaultGameObjectInjectionWorld?.GetOrCreateSystemManaged<ObjectToolSystem>();
            m_PrefabSystem = World.DefaultGameObjectInjectionWorld?.GetOrCreateSystemManaged<PrefabSystem>();
            m_TreeControllerTool = World.DefaultGameObjectInjectionWorld?.GetOrCreateSystemManaged<TreeControllerTool>();
            m_Log.Info($"[{nameof(TreeObjectDefinitionSystem)}] {nameof(OnCreate)}");
        }


        /// <inheritdoc/>
        protected override void OnUpdate()
        {
            m_ObjectDefinitionQuery = SystemAPI.QueryBuilder()
                .WithAllRW<CreationDefinition, Game.Tools.ObjectDefinition>()
                // .WithAll<Updated>()
                .WithNone<Deleted, Overridden>()
                .Build();

            RequireForUpdate(m_ObjectDefinitionQuery);
            NativeArray<Entity> entities = m_ObjectDefinitionQuery.ToEntityArray(Allocator.Temp);

            foreach (Entity entity in entities)
            {
                if (!EntityManager.TryGetComponent(entity, out CreationDefinition currentCreationDefinition))
                {
                    entities.Dispose();
                    return;
                }

                if (!EntityManager.TryGetComponent(entity, out ObjectDefinition currentObjectDefinition) || !EntityManager.HasComponent<Vegetation>(currentCreationDefinition.m_Prefab))
                {
                    entities.Dispose();
                    return;
                }

                Unity.Mathematics.Random random = new ((uint)(Mathf.Abs(currentObjectDefinition.m_Position.x) + Mathf.Abs(currentObjectDefinition.m_Position.z)) * 1000);
                Entity prefabEntity = currentCreationDefinition.m_Prefab;
                if ((m_ToolSystem.activeTool == m_ObjectToolSystem && m_ObjectToolSystem.mode == ObjectToolSystem.Mode.Brush) || m_ToolSystem.activeTool.toolID == "Line Tool")
                {
                    prefabEntity = m_TreeControllerTool.GetNextPrefabEntity(ref random);
                    if (prefabEntity != Entity.Null)
                    {
                        currentCreationDefinition.m_Prefab = prefabEntity;
                        EntityManager.SetComponentData(entity, currentCreationDefinition);
                    }
                }

                if (!EntityManager.HasComponent(prefabEntity, ComponentType.ReadOnly<TreeData>()))
                {
                    return;
                }

                TreeState nextTreeState = m_TreeControllerUISystem.GetNextTreeState(ref random);
                m_Log.Debug($"nextTreeState = {nextTreeState}");
                if (BrushTreeStateAges.ContainsKey(nextTreeState))
                {
                    currentObjectDefinition.m_Age = BrushTreeStateAges[nextTreeState];
                    m_Log.Debug($"currentObjectDefinition.m_Age = {currentObjectDefinition.m_Age}");
                }
                else
                {
                    currentObjectDefinition.m_Age = ObjectUtils.TREE_AGE_PHASE_CHILD + ObjectUtils.TREE_AGE_PHASE_TEEN;
                    m_Log.Debug($"currentObjectDefinition.m_Age = {currentObjectDefinition.m_Age} default");
                }

                EntityManager.SetComponentData(entity, currentObjectDefinition);
                m_Log.Debug($"done");
            }

            entities.Dispose();
        }

    }
}
