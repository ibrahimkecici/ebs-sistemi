import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { FileDownload, Edit } from "@mui/icons-material";
import axios from "../config/axios";
import debounce from "lodash/debounce";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Tables: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDersId, setSelectedDersId] = useState<string>("");
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [studentFilter, setStudentFilter] = useState<string>("");
  const [dersler, setDersler] = useState<any[]>([]);
  const [programlar, setProgramlar] = useState<any[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<{
    programCiktisiId?: string;
    dersCiktisiId?: string;
    deger: number;
    programCiktisi?: string;
    dersCiktisi?: string;
    degerlendirmeKriteriId?: string;
    kriterAdi?: string;
  } | null>(null);

  // Table data states
  const [programDersIliskisi, setProgramDersIliskisi] = useState<any[]>([]);
  const [dersDegerlendirmeIliskisi, setDersDegerlendirmeIliskisi] = useState<
    any[]
  >([]);
  const [dersAgirlikli, setDersAgirlikli] = useState<any[]>([]);
  const [ogrenciDersBasari, setOgrenciDersBasari] = useState<any[]>([]);
  const [ogrenciProgramBasari, setOgrenciProgramBasari] = useState<any[]>([]);

  useEffect(() => {
    // Fetch dersler and programlar on component mount
    const fetchInitialData = async () => {
      try {
        const [derslerRes, programlarRes] = await Promise.all([
          axios.get("/dersler"),
          axios.get("/programlar"),
        ]);
        setDersler(derslerRes.data);
        setProgramlar(programlarRes.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Create a debounced version of fetchTableData for both tables
  const debouncedFetchData = useCallback(
    debounce((filter: string) => {
      if (activeTab === 3 && selectedDersId) {
        axios
          .get(`/ogrenciDersCiktisiBasariOraniTablosu/${selectedDersId}`, {
            params: {
              ogrenciNo: filter || undefined,
            },
          })
          .then((response) => {
            setOgrenciDersBasari(response.data);
          })
          .catch((error) => {
            console.error("Error fetching filtered data:", error);
          });
      } else if (activeTab === 4 && selectedProgramId) {
        axios
          .get(
            `/ogrenciProgramCiktisiBasariOraniTablosu/${selectedProgramId}`,
            {
              params: {
                ogrenciNo: filter || undefined,
              },
            }
          )
          .then((response) => {
            setOgrenciProgramBasari(response.data);
          })
          .catch((error) => {
            console.error("Error fetching filtered data:", error);
          });
      }
    }, 300),
    [activeTab, selectedDersId, selectedProgramId]
  );

  const fetchTableData = async () => {
    try {
      switch (activeTab) {
        case 0:
          if (selectedDersId) {
            const response = await axios.get(
              `/programCiktisiDersCiktisiIliskisiTablosu/${selectedDersId}`
            );
            setProgramDersIliskisi(response.data);
          }
          break;
        case 1:
          if (selectedDersId) {
            const response = await axios.get(
              `/dersCiktisiDegerlendirmeKriteriTablosu/${selectedDersId}`
            );
            setDersDegerlendirmeIliskisi(response.data);
          }
          break;
        case 2:
          if (selectedDersId) {
            const response = await axios.get(
              `/dersAgirlikliDegerlendirmeTablosu/${selectedDersId}`
            );
            setDersAgirlikli(response.data);
          }
          break;
        case 3:
          if (selectedDersId) {
            const response = await axios.get(
              `/ogrenciDersCiktisiBasariOraniTablosu/${selectedDersId}`,
              {
                params: {
                  ogrenciNo: studentFilter || undefined,
                },
              }
            );
            setOgrenciDersBasari(response.data);
          }
          break;
        case 4:
          if (selectedProgramId) {
            const response = await axios.get(
              `/ogrenciProgramCiktisiBasariOraniTablosu/${selectedProgramId}`,
              {
                params: {
                  ogrenciNo: studentFilter || undefined,
                },
              }
            );
            setOgrenciProgramBasari(response.data);
          }
          break;
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, [activeTab, selectedDersId, selectedProgramId]);

  const handleExport = async () => {
    try {
      let url = "";
      let params = {};

      switch (activeTab) {
        case 0:
          url = `/programCiktisiDersCiktisiIliskisiExcel/${selectedDersId}`;
          break;
        case 1:
          url = `/dersCiktisiDegerlendirmeKriteriExcel/${selectedDersId}`;
          break;
        case 2:
          url = `/dersAgirlikliDegerlendirmeExcel/${selectedDersId}`;
          break;
        case 3:
          url = `/ogrenciDersCiktisiBasariOraniExcel/${selectedDersId}`;
          if (studentFilter) {
            params = { ogrenciNo: studentFilter };
          }
          break;
        case 4:
          url = `/ogrenciProgramCiktisiBasariOraniExcel/${selectedProgramId}`;
          if (studentFilter) {
            params = { ogrenciNo: studentFilter };
          }
          break;
      }

      const response = await axios.get(url, {
        responseType: "blob",
        params: params,
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "table-export.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting table:", error);
    }
  };

  const handleEditClick = (
    cikti: string,
    hedef: string,
    deger: number,
    ciktiId: string,
    hedefId: string,
    isProgram: boolean = true
  ) => {
    if (isProgram) {
      setEditingValue({
        programCiktisiId: ciktiId,
        dersCiktisiId: hedefId,
        deger,
        programCiktisi: cikti,
        dersCiktisi: hedef,
      });
    } else {
      setEditingValue({
        dersCiktisiId: ciktiId,
        degerlendirmeKriteriId: hedefId,
        deger,
        dersCiktisi: cikti,
        kriterAdi: hedef,
      });
    }
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingValue) return;

    try {
      if (editingValue.programCiktisiId) {
        // Program-Ders ilişkisi güncelleme
        await axios.post("/programCiktisiDersCiktisiIliskisiGuncelle", {
          programCiktisiId: editingValue.programCiktisiId,
          dersCiktisiId: editingValue.dersCiktisiId,
          deger: editingValue.deger,
        });
      } else {
        // Ders-Değerlendirme ilişkisi güncelleme
        await axios.post("/dersCiktisiDegerlendirmeKriteriGuncelle", {
          dersCiktisiId: editingValue.dersCiktisiId,
          degerlendirmeKriteriId: editingValue.degerlendirmeKriteriId,
          deger: editingValue.deger,
        });
      }

      // Refresh the table data
      fetchTableData();
      setEditModalOpen(false);
      setEditingValue(null);
    } catch (error) {
      console.error("Error updating relationship:", error);
    }
  };

  const renderTable = () => {
    let data: any[] = [];
    let columns: string[] = [];

    switch (activeTab) {
      case 0:
        // Transform the data for program-ders relationship
        if (programDersIliskisi.length > 0) {
          // Get unique ders çıktıları for columns
          const dersCiktilari = Array.from(
            new Set(programDersIliskisi.map((item) => item.ders_ciktisi))
          );

          // Group by program çıktısı
          const groupedByProgram = programDersIliskisi.reduce(
            (acc: any, curr) => {
              if (!acc[curr.program_ciktisi]) {
                acc[curr.program_ciktisi] = {
                  program_ciktisi: curr.program_ciktisi,
                  program_ciktisi_id: curr.program_ciktisi_id,
                  relationships: {},
                  relationshipIds: {},
                };
              }
              acc[curr.program_ciktisi].relationships[curr.ders_ciktisi] =
                Number(curr.iliskiDegeri) || 0;
              acc[curr.program_ciktisi].relationshipIds[curr.ders_ciktisi] =
                curr.ders_ciktisi_id;
              return acc;
            },
            {}
          );

          // Transform into rows
          data = Object.values(groupedByProgram).map((group: any) => {
            const row: any = {
              program_ciktisi: group.program_ciktisi,
              program_ciktisi_id: group.program_ciktisi_id,
            };
            let totalValue = 0;
            dersCiktilari.forEach((dersCiktisi) => {
              const value = Number(group.relationships[dersCiktisi] || 0);
              row[dersCiktisi] = {
                value: value,
                dersCiktisiId: group.relationshipIds[dersCiktisi],
              };
              totalValue += value;
            });
            row.total = Number(totalValue);
            return row;
          });

          // Set up columns
          columns = [
            "Program Çıktısı",
            ...dersCiktilari,
            "Toplam İlişki Değeri",
          ];
        }
        break;
      case 1:
        if (dersDegerlendirmeIliskisi.length > 0) {
          // Get unique değerlendirme kriterleri for columns
          const degerlendirmeKriterleri = Array.from(
            new Map(
              dersDegerlendirmeIliskisi.map((item) => [
                item.kriter_adi,
                {
                  kriter_adi: item.kriter_adi,
                  etki_orani: Number(item.etki_orani) || 0,
                },
              ])
            ).values()
          );

          // Group by ders çıktısı
          const groupedByDersCiktisi = dersDegerlendirmeIliskisi.reduce(
            (acc: any, curr) => {
              if (!acc[curr.ders_ciktisi]) {
                acc[curr.ders_ciktisi] = {
                  ders_ciktisi: curr.ders_ciktisi,
                  ders_ciktisi_id: curr.ders_ciktisi_id,
                  relationships: {},
                  relationshipIds: {},
                };
              }
              acc[curr.ders_ciktisi].relationships[curr.kriter_adi] =
                Number(curr.iliskiDegeri) || 0;
              acc[curr.ders_ciktisi].relationshipIds[curr.kriter_adi] =
                curr.degerlendirme_kriteri_id;
              return acc;
            },
            {}
          );

          // Transform into rows
          data = Object.values(groupedByDersCiktisi).map((group: any) => {
            const row: any = {
              ders_ciktisi: group.ders_ciktisi,
              ders_ciktisi_id: group.ders_ciktisi_id,
            };
            let totalValue = 0;
            degerlendirmeKriterleri.forEach((kriter) => {
              const value = Number(group.relationships[kriter.kriter_adi] || 0);
              row[kriter.kriter_adi] = {
                value: value,
                kriterId: group.relationshipIds[kriter.kriter_adi],
              };
              totalValue += value;
            });
            row.total = Number(totalValue);
            return row;
          });

          // Set up columns
          columns = [
            "Ders Çıktısı",
            ...degerlendirmeKriterleri.map(
              (k) => `${k.kriter_adi} (%${(k.etki_orani * 100).toFixed(0)})`
            ),
            "Toplam İlişki Değeri",
          ];
        }
        break;
      case 2:
        if (dersAgirlikli.length > 0) {
          // Get unique değerlendirme kriterleri for columns
          const kriterler = Array.from(
            new Set(dersAgirlikli.map((item) => item.kriter_adi))
          );

          // Group by ders çıktısı
          const groupedByDersCiktisi = dersAgirlikli.reduce(
            (acc: any, curr) => {
              if (!acc[curr.ders_ciktisi]) {
                acc[curr.ders_ciktisi] = {
                  ders_ciktisi: curr.ders_ciktisi,
                  values: {},
                };
              }
              acc[curr.ders_ciktisi].values[curr.kriter_adi] =
                Number(curr.agirlikliDeger) || 0;
              return acc;
            },
            {}
          );

          // Transform into rows
          data = Object.values(groupedByDersCiktisi).map((group: any) => {
            const row: any = {
              ders_ciktisi: group.ders_ciktisi,
            };
            let totalValue = 0;
            kriterler.forEach((kriter) => {
              const value = Number(group.values[kriter] || 0);
              row[kriter] = value;
              totalValue += value;
            });
            row.total = Number(totalValue);
            return row;
          });

          // Set up columns
          columns = ["Ders Çıktısı", ...kriterler, "Toplam Ağırlıklı Değer"];
        }
        break;
      case 3:
        if (ogrenciDersBasari.length > 0) {
          interface Student {
            ogrenci_no: string;
            ogrenci_adi: string;
            ogrenci_soyadi: string;
          }

          interface DersCiktisi {
            id: string;
            cikti: string;
          }

          // Get unique students using object keys
          const studentsMap = ogrenciDersBasari.reduce((acc, item) => {
            const key = `${item.ogrenci_no}`;
            if (!acc[key]) {
              acc[key] = {
                ogrenci_no: item.ogrenci_no,
                ogrenci_adi: item.ogrenci_adi,
                ogrenci_soyadi: item.ogrenci_soyadi,
              };
            }
            return acc;
          }, {} as Record<string, Student>);

          const students = Object.values(studentsMap) as Student[];

          // Get unique değerlendirme kriterleri for columns
          const kriterler = Array.from(
            new Set(ogrenciDersBasari.map((item) => item.kriter_adi))
          );

          // Transform into rows with student headers
          data = [];
          students.forEach((student) => {
            // Add student header row
            data.push({
              isHeader: true,
              ogrenci_no: student.ogrenci_no,
              ogrenci_adi: student.ogrenci_adi,
              ogrenci_soyadi: student.ogrenci_soyadi,
            });

            // Get unique ders çıktıları for this student using object keys
            const dersCiktilariMap = ogrenciDersBasari
              .filter((item) => item.ogrenci_no === student.ogrenci_no)
              .reduce((acc, item) => {
                const key = `${item.ders_ciktisi_id}`;
                if (!acc[key]) {
                  acc[key] = {
                    id: item.ders_ciktisi_id,
                    cikti: item.ders_ciktisi,
                  };
                }
                return acc;
              }, {} as Record<string, DersCiktisi>);

            const dersCiktilari = Object.values(
              dersCiktilariMap
            ) as DersCiktisi[];

            // Add learning outcome rows for this student
            dersCiktilari.forEach((dersCiktisi) => {
              const row: any = {
                ders_ciktisi_id: dersCiktisi.id,
                ders_ciktisi: dersCiktisi.cikti,
              };

              let totalValue = 0;
              let maxTotalValue = 0;

              kriterler.forEach((kriter) => {
                const match = ogrenciDersBasari.find(
                  (item) =>
                    item.ogrenci_no === student.ogrenci_no &&
                    item.ders_ciktisi_id === dersCiktisi.id &&
                    item.kriter_adi === kriter
                );
                if (match) {
                  const value = Number(match.deger) || 0;
                  const maxValue = Number(match.maxDeger) || 0;
                  row[kriter] = value;
                  totalValue += value * maxValue;
                  maxTotalValue += maxValue;
                } else {
                  row[kriter] = 0;
                }
              });

              row.total = totalValue;
              row.max = maxTotalValue;
              row.basariOrani =
                maxTotalValue > 0 ? (totalValue / maxTotalValue) * 100 : 0;

              data.push(row);
            });
          });

          // Set up columns
          columns = ["Ders Çıktısı", ...kriterler, "Toplam", "MAX", "%BAŞARI"];
        }
        break;
      case 4:
        if (ogrenciProgramBasari.length > 0) {
          // First get unique ders çıktıları for columns
          const dersCiktilari = Array.from(
            new Set(ogrenciProgramBasari.map((item) => item.ders_ciktisi))
          );

          // Group data by student and program outcome
          const groupedByStudent = ogrenciProgramBasari.reduce(
            (acc: any, curr) => {
              const studentKey = `${curr.ogrenci_no}`;
              if (!acc[studentKey]) {
                acc[studentKey] = {
                  student: {
                    ogrenci_no: curr.ogrenci_no,
                    ogrenci_adi: curr.ogrenci_adi,
                    ogrenci_soyadi: curr.ogrenci_soyadi,
                  },
                  dersCiktisiBasariOranlari: {},
                  programOutcomes: {},
                };
              }

              // Store ders çıktısı success rates at student level
              if (
                !acc[studentKey].dersCiktisiBasariOranlari[curr.ders_ciktisi]
              ) {
                acc[studentKey].dersCiktisiBasariOranlari[curr.ders_ciktisi] =
                  curr.ders_ciktisi_basari_orani;
              }

              const programCiktisiKey = curr.program_ciktisi;
              if (!acc[studentKey].programOutcomes[programCiktisiKey]) {
                acc[studentKey].programOutcomes[programCiktisiKey] = {
                  dersCiktisiBasariOranlari: {},
                  programCiktisiBasariOrani: curr.program_ciktisi_basari_orani,
                  ortalama_basari: curr.ortalama_basari,
                };
              }

              // Store weighted success rate for each ders çıktısı
              acc[studentKey].programOutcomes[
                programCiktisiKey
              ].dersCiktisiBasariOranlari[curr.ders_ciktisi] =
                curr.weighted_success;

              return acc;
            },
            {}
          );

          // Transform grouped data into rows
          data = [];
          Object.values(groupedByStudent).forEach((studentData: any) => {
            // Add student header row with ders çıktısı success rates
            data.push({
              isHeader: true,
              ...studentData.student,
              dersCiktisiBasariOranlari: studentData.dersCiktisiBasariOranlari,
            });

            // Add program outcome rows
            Object.entries(studentData.programOutcomes).forEach(
              ([programCiktisi, outcomeData]: [string, any]) => {
                const row: any = {
                  program_ciktisi: programCiktisi,
                };

                // Add weighted success rate for each ders çıktısı
                dersCiktilari.forEach((dersCiktisi) => {
                  row[dersCiktisi] =
                    outcomeData.dersCiktisiBasariOranlari[dersCiktisi] || 0;
                });

                // Add program outcome success rate and average
                row.ortalama_basari = outcomeData.ortalama_basari;

                data.push(row);
              }
            );

            // Add empty row between students
            data.push({ isEmpty: true });
          });

          columns = [
            "Program Çıktısı",
            ...dersCiktilari,
            "Ortalama Başarı (%)",
          ];
        }
        break;
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell key={index}>{column}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index}
                sx={row.isHeader ? { backgroundColor: "#f5f5f5" } : {}}
              >
                {activeTab === 0 ? (
                  <>
                    <TableCell>{row.program_ciktisi}</TableCell>
                    {columns.slice(1, -1).map((dersCiktisi, idx) => (
                      <TableCell key={idx} align="center">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          {row[dersCiktisi]?.value || "-"}
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleEditClick(
                                row.program_ciktisi,
                                dersCiktisi,
                                row[dersCiktisi]?.value || 0,
                                row.program_ciktisi_id,
                                row[dersCiktisi]?.dersCiktisiId
                              )
                            }
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    ))}
                    <TableCell>{row.total}</TableCell>
                  </>
                ) : activeTab === 1 ? (
                  <>
                    <TableCell>{row.ders_ciktisi}</TableCell>
                    {columns.slice(1, -1).map((kriterAdiWithRatio, idx) => {
                      // Extract the original kriter_adi without the ratio
                      const kriterAdi = kriterAdiWithRatio.split(" (")[0];
                      return (
                        <TableCell key={idx} align="center">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 1,
                            }}
                          >
                            {row[kriterAdi]?.value || 0}
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleEditClick(
                                  row.ders_ciktisi,
                                  kriterAdi,
                                  row[kriterAdi]?.value || 0,
                                  row.ders_ciktisi_id,
                                  row[kriterAdi]?.kriterId || "",
                                  false
                                )
                              }
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      );
                    })}
                    <TableCell align="center">{row.total}</TableCell>
                  </>
                ) : activeTab === 2 ? (
                  <>
                    <TableCell>{row.ders_ciktisi}</TableCell>
                    {columns.slice(1, -1).map((kriter, idx) => (
                      <TableCell key={idx} align="center">
                        {Number(row[kriter] || 0).toFixed(2)}
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      {Number(row.total || 0).toFixed(2)}
                    </TableCell>
                  </>
                ) : activeTab === 3 ? (
                  row.isHeader ? (
                    <TableCell
                      colSpan={columns.length}
                      sx={{ fontWeight: "bold" }}
                    >
                      {`${row.ogrenci_no} - ${row.ogrenci_adi} ${row.ogrenci_soyadi}`}
                    </TableCell>
                  ) : (
                    <>
                      <TableCell>{row.ders_ciktisi}</TableCell>
                      {columns.slice(1, -3).map((kriter, idx) => (
                        <TableCell key={idx} align="center">
                          {(row[kriter] * 100).toFixed(2)}%
                        </TableCell>
                      ))}
                      <TableCell align="center">
                        {(row.total * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell align="center">
                        {(row.max * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell align="center">
                        {row.basariOrani.toFixed(2)}%
                      </TableCell>
                    </>
                  )
                ) : row.isEmpty ? (
                  <TableCell colSpan={columns.length} />
                ) : row.isHeader ? (
                  <>
                    <TableCell
                      sx={{
                        backgroundColor: "#f5f5f5",
                        fontWeight: "bold",
                        borderBottom: "2px solid rgba(224, 224, 224, 1)",
                      }}
                    >
                      {`${row.ogrenci_no} - ${row.ogrenci_adi} ${row.ogrenci_soyadi}`}
                    </TableCell>
                    {columns.slice(1, -1).map((dersCiktisi, idx) => (
                      <TableCell
                        key={idx}
                        align="center"
                        sx={{
                          backgroundColor: "#f5f5f5",
                          fontWeight: "bold",
                          borderBottom: "2px solid rgba(224, 224, 224, 1)",
                        }}
                      >
                        {row.dersCiktisiBasariOranlari[dersCiktisi]
                          ? `${Number(
                              row.dersCiktisiBasariOranlari[dersCiktisi]
                            ).toFixed(2)}%`
                          : "0.00%"}
                      </TableCell>
                    ))}
                    <TableCell
                      sx={{
                        backgroundColor: "#f5f5f5",
                        fontWeight: "bold",
                        borderBottom: "2px solid rgba(224, 224, 224, 1)",
                      }}
                      align="center"
                    />
                  </>
                ) : (
                  <>
                    <TableCell>{row.program_ciktisi}</TableCell>
                    {columns.slice(1, -1).map((dersCiktisi, idx) => (
                      <TableCell key={idx} align="center">
                        {typeof row[dersCiktisi] === "number"
                          ? row[dersCiktisi].toFixed(2)
                          : Number(row[dersCiktisi] || 0).toFixed(2)}
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      {typeof row.ortalama_basari === "number"
                        ? row.ortalama_basari.toFixed(2)
                        : Number(row.ortalama_basari || 0).toFixed(2)}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Tablolar
        </Typography>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Program-Ders Çıktısı İlişkisi" />
          <Tab label="Ders-Değerlendirme İlişkisi" />
          <Tab label="Ders Ağırlıklı Değerlendirme" />
          <Tab label="Öğrenci Ders Başarı Oranı" />
          <Tab label="Öğrenci Program Başarı Oranı" />
        </Tabs>

        <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
          {activeTab !== 4 && (
            <FormControl fullWidth>
              <InputLabel>Ders Seçiniz</InputLabel>
              <Select
                value={selectedDersId}
                label="Ders Seçiniz"
                onChange={(e) => {
                  setSelectedDersId(e.target.value);
                }}
              >
                {dersler.map((ders) => (
                  <MenuItem key={ders._id} value={ders._id}>
                    {ders.dersAdi}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {activeTab === 4 && (
            <>
              <FormControl fullWidth>
                <InputLabel>Program Seçiniz</InputLabel>
                <Select
                  value={selectedProgramId}
                  label="Program Seçiniz"
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                >
                  {programlar.map((program) => (
                    <MenuItem key={program._id} value={program._id}>
                      {program.programAdi}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Öğrenci No"
                value={studentFilter}
                onChange={(e) => {
                  const newValue = e.target.value.trim();
                  setStudentFilter(newValue);
                  debouncedFetchData(newValue);
                }}
                placeholder="Öğrenci numarası ile filtrele"
                sx={{ minWidth: 200 }}
                size="small"
                variant="outlined"
              />
            </>
          )}

          {activeTab === 3 && (
            <TextField
              label="Öğrenci No"
              value={studentFilter}
              onChange={(e) => {
                const newValue = e.target.value.trim();
                setStudentFilter(newValue);
                debouncedFetchData(newValue);
              }}
              placeholder="Öğrenci numarası ile filtrele"
              sx={{ minWidth: 200 }}
              size="small"
              variant="outlined"
            />
          )}

          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={handleExport}
            disabled={!selectedDersId && !selectedProgramId}
          >
            Excel'e Aktar
          </Button>
        </Box>

        {renderTable()}

        <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <DialogTitle>İlişki Değerini Düzenle</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {editingValue?.programCiktisi ? (
                <>
                  <Typography variant="body2" gutterBottom>
                    Program Çıktısı: {editingValue.programCiktisi}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Ders Çıktısı: {editingValue.dersCiktisi}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="body2" gutterBottom>
                    Ders Çıktısı: {editingValue?.dersCiktisi}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Değerlendirme Kriteri: {editingValue?.kriterAdi}
                  </Typography>
                </>
              )}
              <TextField
                label="İlişki Değeri"
                type="number"
                value={editingValue?.deger || 0}
                onChange={(e) =>
                  setEditingValue((prev) =>
                    prev ? { ...prev, deger: Number(e.target.value) } : null
                  )
                }
                fullWidth
                margin="normal"
                inputProps={{ min: 0, max: 5, step: 1 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditModalOpen(false)}>İptal</Button>
            <Button onClick={handleEditSave} variant="contained">
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default Tables;
