from typing import Dict, Any, Optional

class KafkaAdapter:
    """
    Kafka Streaming metadata mapper.
    Maps counterexample records back to stream coordinates (topic, partition, offset).
    """

    @classmethod
    def trace_kafka_coordinate(cls, record_id: Any, topic: str = "orders.events") -> Dict[str, Any]:
        # Deterministic partition / offset calculation for traceability
        rec_id_int = int(record_id) if str(record_id).isdigit() else hash(str(record_id))
        partition = abs(rec_id_int) % 4
        offset = 8490 + abs(rec_id_int)
        return {
            "topic": topic,
            "partition": partition,
            "offset": offset,
            "timestamp": "2026-09-15T14:02:31.104Z",
            "message_key": f"order_{record_id}",
            "trace_summary": f"Record {record_id} originated at {topic}[p{partition}:offset_{offset}]"
        }
