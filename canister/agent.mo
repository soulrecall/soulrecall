/**
 * AgentVault Canister (Motoko)
 *
 * This canister serves as the on-chain execution environment for AI agents.
 * It provides state management, task execution, and memory storage.
 */

import Memory "mo:base/Memory";
import Buffer "mo:base/Buffer";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Iter "mo:base/Iter";

// Types

/**
 * Agent configuration
 */
public type AgentConfig = {
  name : Text;
  agentType : Text;
  version : Text;
  createdAt : Int;
};

/**
 * Memory entry
 */
public type Memory = {
  id : Text;
  memoryType : { #fact; #user_preference; #task_result };
  content : Text;
  timestamp : Int;
  importance : Nat8;
};

/**
 * Task entry
 */
public type Task = {
  id : Text;
  description : Text;
  status : { #pending; #running; #completed; #failed };
  result : ?Text;
  timestamp : Int;
};

/**
 * Task queue entry
 */
public type TaskQueue = {
  head : ?Task;
  tail : [Task];
};

// Stable state

stable var agentConfig : ?AgentConfig = null;
stable var memories : [Memory] = [];
stable var tasks : [Task] = [];
stable var context : [(Text, Text)] = [];

// Agent lifecycle

/**
 * Initialize the agent
 */
public query func getAgentConfig() : async ?AgentConfig {
  agentConfig
};

/**
 * Get agent status
 */
public query func getAgentStatus() : async {
  initialized : Bool;
  version : Text;
  totalMemories : Nat;
  totalTasks : Nat;
} {
  {
    initialized = Option.isSome(agentConfig);
    version = switch(agentConfig) {
      case(?c) { c.version };
      case(_) { "0.0.0" };
    };
    totalMemories = memories.size();
    totalTasks = tasks.size();
  }
};

/**
 * Set agent configuration (can only be called once)
 */
public shared func setAgentConfig(config : AgentConfig) : async {
  #ok : Text;
  #err : Text;
} {
  if (Option.isSome(agentConfig)) {
    return #err("Agent already configured");
  };
  agentConfig := ?config;
  #ok("Agent configured successfully")
};

// Memory management

/**
 * Add a memory
 */
public shared func addMemory(memory : Memory) : async {
  #ok : Text;
  #err : Text;
} {
  memories := Array.append(memories, [memory]);
  #ok("Memory added")
};

/**
 * Get all memories
 */
public query func getMemories() : async [Memory] {
  memories
};

/**
 * Get memories by type
 */
public query func getMemoriesByType(memoryType : { #fact; #user_preference; #task_result }) : async [Memory] {
  Array.filter(
    memories,
    func(m : Memory) : Bool {
      switch(m.memoryType, memoryType) {
        case(#fact, #fact) { true };
        case(#user_preference, #user_preference) { true };
        case(#task_result, #task_result) { true };
        case(_) { false };
      }
    }
  )
};

/**
 * Clear memories
 */
public shared func clearMemories() : async Text {
  memories := [];
  "Memories cleared"
};

// Task management

/**
 * Add a task to the queue
 */
public shared func addTask(task : Task) : async {
  #ok : Text;
  #err : Text;
} {
  tasks := Array.append(tasks, [task]);
  #ok("Task added to queue")
};

/**
 * Get all tasks
 */
public query func getTasks() : async [Task] {
  tasks
};

/**
 * Get pending tasks
 */
public query func getPendingTasks() : async [Task] {
  Array.filter(
    tasks,
    func(t : Task) : Bool {
      switch(t.status) {
        case(#pending) { true };
        case(_) { false };
      }
    }
  )
};

/**
 * Get running tasks
 */
public query func getRunningTasks() : async [Task] {
  Array.filter(
    tasks,
    func(t : Task) : Bool {
      switch(t.status) {
        case(#running) { true };
        case(_) { false };
      }
    }
  )
};

/**
 * Update task status
 */
public shared func updateTaskStatus(taskId : Text, status : { #pending; #running; #completed; #failed }, result : ?Text) : async {
  #ok : Text;
  #err : Text;
} {
  let updated = false;
  tasks := Array.map(
    tasks,
    func(t : Task) : Task {
      if (t.id == taskId) {
        updated := true;
        {
          id = t.id;
          description = t.description;
          status = status;
          result = result;
          timestamp = t.timestamp;
        }
      } else {
        t
      }
    }
  );

  if (not updated) {
    #err("Task not found")
  } else {
    #ok("Task status updated")
  }
};

/**
 * Clear tasks
 */
public shared func clearTasks() : async Text {
  tasks := [];
  "Tasks cleared"
};

// Context management

/**
 * Set context value
 */
public shared func setContext(key : Text, value : Text) : async Text {
  context := Array.append(context, [(key, value)]);
  "Context set"
};

/**
 * Get context value
 */
public query func getContext(key : Text) : async ?Text {
  var found : ?Text = null;
  for ((k, v) in context.vals()) {
    if (k == key) {
      found := ?v;
    }
  };
  found
};

/**
 * Get all context
 */
public query func getAllContext() : async [(Text, Text)] {
  context
};

/**
 * Clear context
 */
public shared func clearContext() : async Text {
  context := [];
  "Context cleared"
};

// Agent execution

/**
 * Execute the agent (step function)
 */
public shared func execute(input : Text) : async {
  #ok : Text;
  #err : Text;
} {
  if (Option.isNull(agentConfig)) {
    return #err("Agent not configured")
  };

  // In a real implementation, this would:
  // 1. Load agent WASM module
  // 2. Execute with input
  // 3. Store result
  // 4. Return output

  // Stub: Return success with echo
  #ok("Agent executed: " # input)
};

/**
 * Execute multiple steps (batch processing)
 */
public shared func executeBatch(inputs : [Text]) : async {
  #ok : [Text];
  #err : Text;
} {
  let results : [Text] = [];

  for (input in inputs.vals()) {
    switch(execute(input)) {
      case(#ok(result)) {
        results := Array.append(results, [result])
      };
      case(#err(e)) {
        return #err(e)
      };
    }
  };

  #ok(results)
};

// System functions

/**
 * Get canister status
 */
public query func getCanisterStatus() : async {
  status : { #running; #stopping; #stopped };
  memorySize : Nat;
  cycles : Nat;
} {
  {
    status = #running;
    memorySize = Memory.heapSize();
    cycles = Cycles.balance();
  }
};

/**
 * Get metrics
 */
public query func getMetrics() : async {
  uptime : Int;
  operations : Nat;
  lastActivity : Int;
} {
  // Stub: In a real implementation, these would be tracked
  {
    uptime = Time.now();
    operations = 0;
    lastActivity = Time.now();
  }
};

/**
 * Heartbeat for maintenance
 */
public shared func heartbeat() : async Bool {
  // Perform any necessary maintenance tasks
  true
};
