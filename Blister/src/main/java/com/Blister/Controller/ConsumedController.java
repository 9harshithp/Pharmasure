package com.Blister.Controller;

import com.Blister.Entity.Consumed;
import com.Blister.Entity.Medication;
import com.Blister.Entity.Patient;
import com.Blister.Repository.ConsumedRepository;
import com.Blister.Repository.MedicationRepository;
import com.Blister.Repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@CrossOrigin("*")
@RequestMapping("/consumed")
public class ConsumedController {

    @Autowired
    private ConsumedRepository consumedRepository;

    @Autowired
    private MedicationRepository medicationRepository;

    @Autowired
    private PatientRepository patientRepository;

//    @GetMapping("/check/{email}")
//    public ResponseEntity<?> checkPatientConsumption(@PathVariable String email) {
//        Patient patient = patientRepository.findByEmail(email);
//        if (patient == null) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Patient not found");
//        }
//
//        List<Medication> meds = medicationRepository.findByPatient(patient);
//        LocalDate today = LocalDate.now();
//        List<Map<String, Object>> report = new ArrayList<>();
//
//        for (Medication med : meds) {
//            String[] timings = med.getTiming().split(",");
//            for (String t : timings) {
//                String timing = t.trim();
//                LocalDateTime start = null;
//                LocalDateTime end = null;
//
//                // Define time slots for each timing
//                switch (timing.toLowerCase()) {
//                    case "morning":
//                        start = today.atTime(8, 30);
//                        end = today.atTime(9, 30);
//                        break;
//                    case "afternoon":
//                        start = today.atTime(13, 30);
//                        end = today.atTime(14, 30);
//                        break;
//                    case "evening":
//                        start = today.atTime(18, 30);
//                        end = today.atTime(19, 30);
//                        break;
//                    default:
//                        continue;
//                }
//
//                boolean taken = consumedRepository
//                        .existsByMedicationAndDateTimeBetween(med, start, end);
//
//                Map<String, Object> entry = new HashMap<>();
//                entry.put("tabletName", med.getTableName());
//                entry.put("timing", timing);
//                entry.put("status", taken ? "Taken on time ✅" : "Tablet not taken ❌");
//                report.add(entry);
//            }
//        }
//
//        return ResponseEntity.ok(report);
//    }

    @GetMapping("/check/{email}")
    public ResponseEntity<?> checkPatientConsumption(@PathVariable String email) {
        Patient patient = patientRepository.findByEmail(email);
        if (patient == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Patient not found");
        }

        List<Medication> meds = medicationRepository.findByPatient(patient);
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> report = new ArrayList<>();

        for (Medication med : meds) {
            String[] timings = med.getTiming().split(",");
            for (String t : timings) {
                String timing = t.trim();
                LocalDateTime start = null;
                LocalDateTime end = null;
                LocalDateTime graceEnd = null; // additional window for late consumption

                // Define time slots and grace periods
                switch (timing.toLowerCase()) {
                    case "morning":
                        start = today.atTime(8, 30);
                        end = today.atTime(9, 30);
                        graceEnd = today.atTime(12, 0); // late but acceptable
                        break;
                    case "afternoon":
                        start = today.atTime(13, 30);
                        end = today.atTime(14, 30);
                        graceEnd = today.atTime(17, 0);
                        break;
                    case "evening":
                        start = today.atTime(18, 30);
                        end = today.atTime(19, 30);
                        graceEnd = today.atTime(22, 0);
                        break;
                    default:
                        continue;
                }

                boolean takenOnTime = consumedRepository.existsByMedicationAndDateTimeBetween(med, start, end);
                boolean takenLate = false;

                // Check for late taken within grace period
                if (!takenOnTime && graceEnd != null) {
                    takenLate = consumedRepository.existsByMedicationAndDateTimeBetween(med, end, graceEnd);
                }

                Map<String, Object> entry = new HashMap<>();
                entry.put("tabletName", med.getTableName());
                entry.put("timing", timing);

                if (takenOnTime) {
                    entry.put("status", "Taken on time ✅");
                } else if (takenLate) {
                    entry.put("status", "Taken ✅");
                } else {
                    entry.put("status", "Tablet not taken ❌");
                }

                report.add(entry);
            }
        }

        return ResponseEntity.ok(report);
    }


    // GET all consumed records for a patient
    @GetMapping("/bypatient/{p_id}")
    public List<Consumed> getConsumedByPatient(@PathVariable("p_id") Integer p_id) {
        return consumedRepository.findByMedicationPatientPid(p_id);
    }
}