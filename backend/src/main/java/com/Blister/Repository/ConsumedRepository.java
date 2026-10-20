package com.Blister.Repository;

import com.Blister.Entity.Consumed;
import com.Blister.Entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ConsumedRepository extends JpaRepository<Consumed , Integer> {

    List<Consumed> findByMedicationPatientPid(Integer pid);

    boolean existsByMedicationAndDateTimeBetween(Medication medication, LocalDateTime start, LocalDateTime end);

}
